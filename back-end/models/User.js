// User model definition

class User {
  constructor({id, username, email, password, role = 'user'}) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password; // In a real app, this should be hashed
    this.role = role;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export default User;