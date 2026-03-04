import { expect, test } from '@playwright/test';

test.describe('Staff message board integration', () => {
  test('creates, replies, and deletes a message while toggling replies', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /staff message board/i })).toBeVisible();

    const titleInput = page.getByPlaceholder('Title');
    const nameInput = page.getByPlaceholder('Your name');
    const messageInput = page.getByPlaceholder('Your message');

    await titleInput.fill('Integration Title');
    await nameInput.fill('Integration Tester');
    await messageInput.fill('Integration message body');

    await page.getByRole('button', { name: /post/i }).click();

    const card = page.locator('div', { hasText: 'Integration Title' }).first();
    await expect(card.getByRole('heading', { name: 'Integration Title' })).toBeVisible();

    const toggleReplies = () => card.getByRole('button', { name: /replies/i });
    await toggleReplies().click();

    const replyForm = card.locator('form').last();
    await replyForm.getByPlaceholder('Your name').fill('Replier');
    await replyForm.getByPlaceholder('Reply').fill('Integration reply');

    await replyForm.getByRole('button', { name: /^Reply$/i }).click();
    await expect(card.getByText('Integration reply')).toBeVisible();

    await toggleReplies().click();
    await toggleReplies().click();

    await card.getByRole('button', { name: /delete/i }).click();
    await expect(card).toBeHidden();
  });
});
