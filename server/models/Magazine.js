const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['cover', 'toc', 'message', 'standard', 'tabular', 'articles', 'events', 'gallery'],
    default: 'standard',
  },
  content: { type: mongoose.Schema.Types.Mixed, default: '' },
  articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  order: { type: Number, default: 0 },
  isFixed: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  tableConfig: {
    columns: [String],
    rows: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  meta: { type: Map, of: mongoose.Schema.Types.Mixed },
});

const DEFAULT_SECTIONS = [
  { title: 'Cover Page', type: 'cover', order: 1, isFixed: true, content: { subtitle: 'Department of Computer Engineering', year: new Date().getFullYear() } },
  { title: 'Table of Contents', type: 'toc', order: 2, isFixed: true },
  { title: "HoD's Message", type: 'message', order: 3, isFixed: true, content: { name: 'Dr. M. Kiruthika', designation: 'Head of Department, Computer Engineering', text: 'Dear Students and Stakeholders,\n\nIt is with great pleasure that I extend a warm welcome to the Computer Engineering Department at Fr. C.R.I.T, Vashi, Navi Mumbai. As the Head of the Department, I am delighted to provide you with an overview of our esteemed UG degree program, which accommodates an intake of 120 students and holds accreditation from the National Board of Accreditation (NBA).' } },
  { title: 'Department Details', type: 'standard', order: 4, isFixed: true, content: 'The Department of Computer Engineering at Fr. C. Rodrigues Institute of Technology, Vashi, was established in 1994. The department continuously strives to comply with the goal of providing innovative and quality education with the emerging technologies to achieve academic excellence and provides a platform for the students to achieve their career goals.\n\nThe department has the proud privilege of having qualified, experienced and dedicated faculty. It has modern computing amenities equipped with the latest tools and technologies. The National Board of Accreditation (NBA), New Delhi, has accredited the department in the year 2006, 2012, 2016, 2019 and 2022.' },
  { title: 'Department Vision & Mission', type: 'standard', order: 5, isFixed: true, content: 'VISION:\nTo contribute significantly towards industry and research oriented technical education leading to self-sustainable professionals and responsible citizens.\n\nMISSION:\n• To provide quality and application oriented education to meet the industry requirements.\n• To prepare technically competent, ethical, socially committed professionals with good leadership qualities.\n• To facilitate an opportunity to interact with prominent institutes, alumni and industries to understand the emerging trends in computer technology.' },
  { title: 'Program Objectives & Outcomes', type: 'standard', order: 6, isFixed: true, content: 'PROGRAM EDUCATIONAL OBJECTIVES (PEO):\nGraduates will be able to:\n1. Excel in professional career and higher education in the thrust area of computer engineering.\n2. Develop software products by adapting to the trends in emerging technologies to solve real life problems.\n3. Exhibit ethical practices, professional conduct and leadership qualities with an innovative mind set.\n\nPROGRAM SPECIFIC OUTCOMES (PSO):\nGraduates will be able to:\n1. Apply problem solving skills in the area of Computer Engineering.\n2. Demonstrate programming and system integration skills in various domains.\n3. Inculcate self-learning and research attitude with collaborative working skills.' },
  { title: 'Faculty Details', type: 'tabular', order: 7, isFixed: true, tableConfig: { columns: ['Name', 'Designation', 'Qualification'], rows: [] } },
  { title: 'Department Events', type: 'events', order: 8, isFixed: true, content: [] },
  { title: 'Student Achievements — Co-Curricular', type: 'tabular', order: 9, isFixed: true, tableConfig: { columns: ['Sr No', 'Name of Student', 'Activity', 'Organizing Institute/Body', 'Awards Won'], rows: [] } },
  { title: 'Extra-Curricular Activities', type: 'tabular', order: 10, isFixed: true, tableConfig: { columns: ['Sr No', 'Name of Student', 'Activity', 'Organizing Institute/Body', 'Awards Won'], rows: [] } },
  { title: 'Faculty Achievements', type: 'tabular', order: 11, isFixed: true, tableConfig: { columns: ['Sr No', 'Name of Faculty', 'Achievement', 'Date'], rows: [] } },
  { title: 'Faculty Publications', type: 'tabular', order: 12, isFixed: true, tableConfig: { columns: ['Sr No', 'Name of Faculty', 'Title of Paper', 'Publication Details', 'Indexing'], rows: [] } },
  { title: 'Campus Placements', type: 'tabular', order: 13, isFixed: true, tableConfig: { columns: ['Name of Student', 'Placed Company', 'Package (LPA)'], rows: [] } },
  { title: 'Industrial Visits', type: 'events', order: 14, isFixed: true, content: [] },
  { title: 'Technical Articles', type: 'articles', order: 15, isFixed: true, articles: [] },
];

const magazineSchema = new mongoose.Schema({
  year: { type: Number, default: new Date().getFullYear() },
  title: { type: String, default: 'ZEPHYR 2025' },
  theme: { type: String, default: 'zephyr-2025' },
  sections: [sectionSchema],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

magazineSchema.statics.getDefaultSections = function() {
  return DEFAULT_SECTIONS;
};

const Magazine = mongoose.model('Magazine', magazineSchema);

module.exports = Magazine;
module.exports.DEFAULT_SECTIONS = DEFAULT_SECTIONS;

