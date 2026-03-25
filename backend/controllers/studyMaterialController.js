import StudyMaterial from '../models/StudyMaterial.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { notifyClients } from '../services/socketService.js';

export const getStudyMaterials = async (req, res) => {
  try {
    const { subjectId, teacherId } = req.query;
    const filter = {};
    if (subjectId) filter.subjectId = subjectId;
    if (teacherId) filter.teacherId = teacherId;
    const materials = await StudyMaterial.find(filter)
      .populate('subjectId', 'subjectName')
      .populate('teacherId')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudyMaterialById = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id)
      .populate('subjectId', 'subjectName')
      .populate('teacherId');
    if (!material) return res.status(404).json({ message: 'Study material not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createStudyMaterial = async (req, res) => {
  try {
    let fileUrl = req.body.fileUrl;
    if (req.file?.buffer) {
      const { url } = await uploadToCloudinary(req.file.buffer, 'erp/materials');
      fileUrl = url;
    }
    if (!fileUrl) return res.status(400).json({ message: 'File or fileUrl required' });

    const material = await StudyMaterial.create({
      ...req.body,
      fileUrl,
      fileType: req.file?.mimetype || req.body.fileType,
    });
    const populated = await StudyMaterial.findById(material._id)
      .populate('subjectId', 'subjectName')
      .populate('teacherId');

    // Notify students enrolled in this subject's course
    const Subject = (await import('../models/Subject.js')).default;
    const subject = await Subject.findById(material.subjectId);
    if (subject?.courseId) {
      const students = await Student.find({ course: subject.courseId }).populate('userId');
      for (const s of students) {
        await Notification.create({
          userId: s.userId._id,
          message: `New study material: ${populated.title}`,
          type: 'study_material',
          link: '/student/materials',
        });
      }
    }
    notifyClients('new_study_material', { material: populated });
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('subjectId', 'subjectName')
      .populate('teacherId');
    if (!material) return res.status(404).json({ message: 'Study material not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: 'Study material not found' });
    res.json({ message: 'Study material deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
