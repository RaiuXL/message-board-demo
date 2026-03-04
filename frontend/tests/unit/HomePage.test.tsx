import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../../app/page'

describe('Message Board Page', () => {
    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders messages returned from the API', async () => {
        ; (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 1,
                    title: 'Blood draws',
                    body: 'Please prep residents',
                    author_name: 'Nathan',
                    created_at: new Date().toISOString(),
                    reply_count: 0,
                },
            ],
        })

        render(<HomePage />)

        expect(await screen.findByText('Blood draws')).toBeInTheDocument()
        expect(await screen.findByText('Please prep residents')).toBeInTheDocument()
    })

    it('submits a new message when form is filled', async () => {
        const user = userEvent.setup()

            ; (global.fetch as jest.Mock)
                // First call = GET
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            })
            // Second call = POST
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 2,
                    title: 'Staff Party',
                    body: 'Friday at 5',
                    author_name: 'Nathan',
                    created_at: new Date().toISOString(),
                    reply_count: 0,
                }),
            })
            // Third call = refetch after submit
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            })

        render(<HomePage />)

        await user.type(screen.getByPlaceholderText(/title/i), 'Staff Party')
        await user.type(screen.getByPlaceholderText(/your name/i), 'Nathan')
        await user.type(screen.getByPlaceholderText(/your message/i), 'Friday at 5')

        await user.click(screen.getByRole('button', { name: /post/i }))

        expect(global.fetch).toHaveBeenCalledTimes(3)

        expect(global.fetch).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('/messages'),
            expect.objectContaining({
                method: 'POST',
            })
        )
    })

    it('shows a loading indicator while fetching messages', async () => {
        let resolveFetch: (value: unknown) => void
        const pending = new Promise((resolve) => {
            resolveFetch = resolve
        })

        ; (global.fetch as jest.Mock).mockReturnValueOnce(pending)

        render(<HomePage />)

        expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument()

        resolveFetch({
            ok: true,
            json: async () => [],
        })

        await waitFor(() => {
            expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument()
        })
    })

    it('toggles replies inline', async () => {
        const fetchMock = global.fetch as jest.Mock
        fetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    {
                        id: 1,
                        title: 'Blood draws',
                        body: 'Please prep residents',
                        author_name: 'Nathan',
                        created_at: new Date().toISOString(),
                        reply_count: 1,
                    },
                ],
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    {
                        id: 10,
                        body: 'Will do',
                        author_name: 'Admin',
                        created_at: new Date().toISOString(),
                        message_id: 1,
                    },
                ],
            })

        render(<HomePage />)

        expect(await screen.findByText('Blood draws')).toBeInTheDocument()
        const toggleButton = screen.getByRole('button', {
            name: /show replies \(1\)/i,
        })

        await userEvent.click(toggleButton)

        expect(await screen.findByText('Will do')).toBeInTheDocument()
        expect(toggleButton).toHaveTextContent(/hide replies/i)

        await userEvent.click(toggleButton)
        expect(toggleButton).toHaveTextContent(/show replies \(1\)/i)
    })

    it('submits a reply via the inline form', async () => {
        const fetchMock = global.fetch as jest.Mock
        fetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    {
                        id: 1,
                        title: 'Blood draws',
                        body: 'Please prep residents',
                        author_name: 'Nathan',
                        created_at: new Date().toISOString(),
                        reply_count: 1,
                    },
                ],
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    {
                        id: 10,
                        body: 'Will do',
                        author_name: 'Admin',
                        created_at: new Date().toISOString(),
                        message_id: 1,
                    },
                ],
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 11,
                    body: 'Echo reply',
                    author_name: 'Olivia',
                    created_at: new Date().toISOString(),
                    message_id: 1,
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    {
                        id: 10,
                        body: 'Will do',
                        author_name: 'Admin',
                        created_at: new Date().toISOString(),
                        message_id: 1,
                    },
                    {
                        id: 11,
                        body: 'Echo reply',
                        author_name: 'Olivia',
                        created_at: new Date().toISOString(),
                        message_id: 1,
                    },
                ],
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    {
                        id: 1,
                        title: 'Blood draws',
                        body: 'Please prep residents',
                        author_name: 'Nathan',
                        created_at: new Date().toISOString(),
                        reply_count: 2,
                    },
                ],
            })

        render(<HomePage />)

        expect(await screen.findByText('Blood draws')).toBeInTheDocument()

        const toggleButton = screen.getByRole('button', {
            name: /show replies \(1\)/i,
        })
        await userEvent.click(toggleButton)

        expect(await screen.findByText('Will do')).toBeInTheDocument()

        const replyButton = screen.getByRole('button', { name: /^Reply$/i })
        const replyForm = replyButton.closest('form') as HTMLFormElement
        const nameInput = within(replyForm).getByPlaceholderText(/your name/i)
        const replyInput = within(replyForm).getByPlaceholderText(/reply/i)

        await userEvent.type(nameInput, 'Olivia')
        await userEvent.type(replyInput, 'Echo reply')
        await userEvent.click(replyButton)

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(5)
        })

        expect(fetchMock).toHaveBeenNthCalledWith(
            3,
            expect.stringContaining('/messages/1/replies'),
            expect.objectContaining({
                method: 'POST',
            })
        )

        expect(await screen.findByText('Echo reply')).toBeInTheDocument()
    })

    it('deletes a message and refetches', async () => {
        const fetchMock = global.fetch as jest.Mock
        fetchMock
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    {
                        id: 1,
                        title: 'Blood draws',
                        body: 'Please prep residents',
                        author_name: 'Nathan',
                        created_at: new Date().toISOString(),
                        reply_count: 0,
                    },
                ],
            })
            .mockResolvedValueOnce({
                ok: true,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            })

        render(<HomePage />)

        expect(await screen.findByText('Blood draws')).toBeInTheDocument()

        const deleteButton = screen.getByRole('button', { name: /delete/i })
        await userEvent.click(deleteButton)

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(3)
        })

        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('/messages/1'),
            expect.objectContaining({ method: 'DELETE' })
        )

        await waitFor(() => {
            expect(screen.queryByText('Blood draws')).not.toBeInTheDocument()
        })
    })
})
