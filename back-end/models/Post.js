// Post model definition

class Post {
  constructor({id, title, description, location, date, user_id, imageUrl = null}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.location = location;
    this.date = date;
    this.user_id = user_id;
    this.imageUrl = imageUrl;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export default Post;