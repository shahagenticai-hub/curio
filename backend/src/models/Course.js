import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    thumbnail: { type: String },
    channelTitle: { type: String },
    source: { type: String, default: "youtube" },
  },
  { _id: false }
);

const LessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    resources: { type: [ResourceSchema], default: [] },
  },
  { _id: false }
);

const ModuleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    lessons: { type: [LessonSchema], default: [] },
  },
  { _id: false }
);

const CourseSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    modules: { type: [ModuleSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Course", CourseSchema);
