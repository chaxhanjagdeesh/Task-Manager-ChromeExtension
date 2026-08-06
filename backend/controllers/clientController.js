import Client from "../models/Client.js";

export const createClient = async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      owner: req.user.id,
    });

    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({
      owner: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(clients);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id,
      },
      req.body,
      {
        new: true,
      }
    );

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json({
      message: "Client deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};