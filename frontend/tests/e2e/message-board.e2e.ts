import { expect, test } from '@playwright/test';

test.describe('Staff message board E2E', () => {
  test('user can post, reply, and delete messages', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /staff message board/i })).toBeVisible();

    const titleInput = page.getByPlaceholder('Title');
    const nameInput = page.getByPlaceholder('Your name');
    const messageInput = page.getByPlaceholder('Your message');
    const postButton = page.getByRole('button', { name: /post/i });

    await titleInput.fill('E2E Title');
    await nameInput.fill('E2E Tester');
    await messageInput.fill('E2E body');
    await postButton.click();

    const card = page.getByRole('heading', { name: 'E2E Title' }).locator('..').first();
    await expect(card.getByText('E2E body')).toBeVisible();
    await expect(card.getByText(/Posted by E2E Tester/i)).toBeVisible();

    const toggleButton = () => card.getByRole('button', { name: /replies/i });
    await toggleButton().click();

    const replyForm = card.locator('form').last();
    await replyForm.getByPlaceholder('Your name').fill('E2E Reply');
    await replyForm.getByPlaceholder('Reply').fill('E2E reply body');
    await replyForm.getByRole('button', { name: /^Reply$/i }).click();

    await expect(card.getByText('E2E reply body')).toBeVisible();
    await expect(toggleButton()).toHaveText(/hide replies/i);

    await toggleButton().click();
    await expect(toggleButton()).toHaveText(/show replies/i);

    await card.getByRole('button', { name: /delete/i }).click();
    await expect(card).toBeHidden();
  });
});
