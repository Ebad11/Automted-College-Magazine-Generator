const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const mammoth = require('mammoth');
const Article = require('../models/Article');
const Magazine = require('../models/Magazine');
const { DEFAULT_SECTIONS } = require('../models/Magazine');
const { protect, restrictTo } = require('../middleware/auth');
const logActivity = require('../utils/logActivity');
const { structureDataWithAI } = require('../utils/aiService');

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } });

// Helper: get or create the current magazine with full default sections
const getCurrentMagazine = async () => {
  let mag = await Magazine.findOne({ status: 'draft' }).sort({ createdAt: -1 });
  if (!mag) {
    mag = await Magazine.create({
      title: 'ZEPHYR 2025',
      year: new Date().getFullYear(),
      sections: DEFAULT_SECTIONS,
    });
  }
  return mag;
};

// GET /api/magazine/config — Get current magazine config
router.get('/config', protect, async (req, res) => {
  try {
    const mag = await getCurrentMagazine();
    res.json({ success: true, magazine: mag });
  } catch (err) {
    console.error('❌ Error fetching magazine config:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/magazine/sections — Bulk update all sections (reorder, content, etc.)
router.patch('/sections', protect, restrictTo('lab_assistant'), async (req, res) => {
  try {
    const { sections } = req.body;
    const mag = await getCurrentMagazine();
    // Re-assign order based on array position
    mag.sections = sections.map((s, i) => ({ ...s, order: i + 1 }));
    await mag.save();
    res.json({ success: true, magazine: mag });
  } catch (err) {
    console.error('❌ Error saving sections:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/magazine/section/:sectionId — Update a single section's content
router.patch('/section/:sectionId', protect, restrictTo('lab_assistant'), async (req, res) => {
  try {
    const mag = await getCurrentMagazine();
    const section = mag.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const { title, content, tableConfig, articles, type } = req.body;
    if (title !== undefined) section.title = title;
    if (content !== undefined) section.content = content;
    if (tableConfig !== undefined) section.tableConfig = tableConfig;
    if (articles !== undefined) section.articles = articles;
    if (type !== undefined) section.type = type;

    await mag.save();
    res.json({ success: true, section });
  } catch (err) {
    console.error('❌ Error saving section:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/magazine/section — Add a new custom section
router.post('/section', protect, restrictTo('lab_assistant'), async (req, res) => {
  try {
    const mag = await getCurrentMagazine();
    const { title, type } = req.body;
    const newSection = {
      title: title || 'New Section',
      type: type || 'standard',
      order: mag.sections.length + 1,
      isFixed: false,
      content: type === 'events' ? [] : type === 'tabular' ? '' : '',
      tableConfig: type === 'tabular' ? { columns: ['Column 1', 'Column 2'], rows: [] } : undefined,
    };
    mag.sections.push(newSection);
    await mag.save();
    const created = mag.sections[mag.sections.length - 1];
    res.json({ success: true, section: created, magazine: mag });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/magazine/section/:sectionId — Remove a custom section
router.delete('/section/:sectionId', protect, restrictTo('lab_assistant'), async (req, res) => {
  try {
    const mag = await getCurrentMagazine();
    const section = mag.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    if (section.isFixed) return res.status(403).json({ success: false, message: 'Cannot delete a fixed section' });
    mag.sections.pull(req.params.sectionId);
    await mag.save();
    res.json({ success: true, magazine: mag });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/magazine/process-document — AI-powered document data extraction
router.post('/process-document', protect, restrictTo('lab_assistant'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { sectionType, columns } = req.body;
    let extractedText = '';

    const fname = req.file.originalname.toLowerCase();
    if (fname.endsWith('.xlsx') || fname.endsWith('.xls')) {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      extractedText = JSON.stringify(xlsx.utils.sheet_to_json(sheet));
    } else if (fname.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ path: req.file.path });
      extractedText = result.value;
    } else {
      return res.status(400).json({ success: false, message: 'Only .xlsx, .xls, .docx files are supported' });
    }

    const structuredData = await structureDataWithAI(extractedText, sectionType, columns ? JSON.parse(columns) : null);
    res.json({ success: true, data: structuredData });
  } catch (err) {
    console.error('❌ AI Processing Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/magazine/preview — existing compat route
router.get('/preview', protect, async (req, res) => {
  try {
    const articles = await Article.find({ status: 'approved' })
      .populate('author', 'name department rollNumber')
      .sort({ isFeatured: -1, order: 1, createdAt: 1 });
    res.json({ success: true, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/magazine/generate — log generation event
router.post('/generate', protect, restrictTo('lab_assistant'), async (req, res) => {
  try {
    const { templateName, articleCount } = req.body;
    await logActivity({
      user: req.user, action: 'MAGAZINE_GENERATED',
      details: `Magazine generated with template "${templateName}", ${articleCount} articles`,
      req, severity: 'success',
    });
    res.json({ success: true, message: 'Magazine generation event logged.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
