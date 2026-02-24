const express = require('express');
const { fn, col } = require('sequelize');
const { Message, Reply } = require('../models');

const router = express.Router();

// if there is no message associated with the id provided
router.param('id', (req, res, next, id) => {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return res.status(400).json({ error: 'Invalid message id' });
  }
  req.messageId = parsed;
  next();
});

// retrieve all messages
router.get('/', async (req, res, next) => {
  try {
    const messageGroup = [
      'Message.id',
      'Message.title',
      'Message.body',
      'Message.author_name',
      'Message.created_at',
    ];

    const messages = await Message.findAll({
      attributes: {
        include: [[fn('COUNT', col('replies.id')), 'reply_count']],
      },
      include: [
        {
          model: Reply,
          as: 'replies',
          attributes: [],
        },
      ],
      group: messageGroup,
      order: [['created_at', 'DESC']],
    });

    res.json(
      messages.map((message) => {
        const plain = message.get({ plain: true });
        return {
          ...plain,
          reply_count: Number(plain.reply_count) || 0,
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

// retrieve message associated with id
router.get('/:id', async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const replies = await Reply.findAll({
      where: { message_id: req.messageId },
      order: [['created_at', 'ASC']],
    });

    res.json({ ...message.get({ plain: true }), replies });
  } catch (error) {
    next(error);
  }
});

// insert new message
router.post('/', async (req, res, next) => {
  try {
    const { title, body, author_name } = req.body;
    if (!title || !body || !author_name) {
      return res.status(400).json({ error: 'title, body, and author_name are required' });
    }

    const message = await Message.create({
      title,
      body,
      author_name,
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

// delete message associated with id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Message.destroy({ where: { id: req.messageId } });
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// insert a reply to message
router.post('/:id/replies', async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const { body, author_name } = req.body;
    if (!body || !author_name) {
      return res.status(400).json({ error: 'body and author_name are required' });
    }

    const reply = await Reply.create({
      body,
      author_name,
      message_id: req.messageId,
    });

    res.status(201).json(reply);
  } catch (error) {
    next(error);
  }
});

// retrieve all replies from message associated with id
router.get('/:id/replies', async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const replies = await Reply.findAll({
      where: { message_id: req.messageId },
      order: [['created_at', 'ASC']],
    });

    res.json(replies);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
