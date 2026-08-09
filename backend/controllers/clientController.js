import Client from "../models/Client.js";
import Entry from "../models/Entry.js";
import mongoose from "mongoose";

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
    const clients = await Client.aggregate([
      // Only current user's clients
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user.id),
        },
      },

      // Get entries of each client
      {
        $lookup: {
          from: "entries",
          localField: "_id",
          foreignField: "client",
          pipeline: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                title: 1,
                type: 1,
                createdAt: 1,
              },
            },
          ],
          as: "lastEntry",
        },
      },

      // Convert array -> object
      {
        $unwind: {
          path: "$lastEntry",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Sort by latest activity
      {
        $sort: {
          "lastEntry.createdAt": -1,
          createdAt: -1,
        },
      },
    ]);

    res.json(clients);
  } catch (err) {
    console.log(err);

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