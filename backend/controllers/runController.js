const RunSession = require('../models/RunSession');

const listRuns = async (req, res) => {
  const runs = await RunSession.find();
  res.json(runs);
};

const getRunById = async (req, res) => {
  const run = await RunSession.findById(req.params.id);

  if (!run) {
    return res.status(404).json({ message: 'Treino não encontrado.' });
  }

  res.json(run);
};

const createRun = async (req, res) => {
  const newRun = new RunSession(req.body);
  const savedRun = await newRun.save();

  res.status(201).json(savedRun);
};

const updateRun = async (req, res) => {
  const updatedRun = await RunSession.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedRun) {
    return res.status(404).json({ message: 'Treino não encontrado.' });
  }

  res.json(updatedRun);
};

const deleteRun = async (req, res) => {
  const deletedRun = await RunSession.findByIdAndDelete(req.params.id);

  if (!deletedRun) {
    return res.status(404).json({ message: 'Treino não encontrado.' });
  }

  res.json({ message: 'Treino removido com sucesso.' });
};

module.exports = {
  listRuns,
  getRunById,
  createRun,
  updateRun,
  deleteRun
};