import Client from "../models/Client.js";
import Entry from "../models/Entry.js";

export const createEntry = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.clientId,
      owner: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const entry = await Entry.create({
      client: client._id,
      owner: req.user.id,

      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      amount: req.body.amount,
      status: req.body.status,
      isBilled: req.body.isBilled,
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getEntries = async (req, res) => {
  try {
    const entries = await Entry.find({
      client: req.params.clientId,
      owner: req.user.id,
    }).sort({
      createdAt: 1,
    });

    res.json(entries);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getEntry = async (req, res) => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    res.json(entry);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const updateEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id,
      },
      req.body,
      {
        new: true,
      }
    );

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    res.json(entry);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    res.json({
      message: "Entry deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const toggleCutEntry = async (req, res) => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    entry.isCut = !entry.isCut;

    await entry.save();

    res.json(entry);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};