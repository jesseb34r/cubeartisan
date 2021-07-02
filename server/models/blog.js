import mongoose from 'mongoose';

// Blog schema
const blogSchema = mongoose.Schema({
  title: String,
  body: String,
  owner: String,
  date: Date,
  cube: String,
  markdown: String,
  dev: String,
  date_formatted: String,
  username: {
    type: String,
    default: 'User',
  },
  cubename: {
    type: String,
    default: 'Cube',
  },
});

blogSchema.index({
  cube: 1,
  date: -1,
});

blogSchema.index({
  owner: 1,
  date: -1,
});

blogSchema.index({
  cube: 1,
  date: -1,
});

blogSchema.index({
  dev: 1,
  date: -1,
});

blogSchema.index({
  cube: 1,
  owner: 1,
  dev: 1,
  date: -1,
});

export default mongoose.model('Blog', blogSchema);
