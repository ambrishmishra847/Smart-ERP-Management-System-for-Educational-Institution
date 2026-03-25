import Fee from '../models/Fee.js';

export const getFees = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    const fees = await Fee.find(filter).populate('studentId').sort({ dueDate: -1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('studentId');
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createFee = async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    const populated = await Fee.findById(fee._id).populate('studentId');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateFee = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.status === 'paid') updates.paidDate = new Date();
    const fee = await Fee.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('studentId');
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    res.json({ message: 'Fee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
