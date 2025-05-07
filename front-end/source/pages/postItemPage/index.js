import { BasePage } from "../BasePage/BasePage.js";
import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";

export class PostItemPage extends BasePage {
  #container = null;
  #tags = [];
  #imageFile = null;

  constructor() {
    super();
    this.loadCSS("pages/PostItemPage", "PostItemPage");
  }

  render() {
    if (this.#container) {
      return this.#container;
    }

    this.#container = document.createElement("div");
    this.#container.className = "post-item-page";

    this.#setupMainContent();
    this.#attachEventListeners();

    return this.#container;
  }

  #setupMainContent() {
    // Change from div to form element
    const formContainer = document.createElement("form");
    formContainer.className = "form-container";
    // Prevent default form submission
    formContainer.addEventListener('submit', (e) => e.preventDefault());

    // Title
    const titleGroup = document.createElement("div");
    titleGroup.className = "form-group";
    const titleLabel = document.createElement("label");
    titleLabel.className = "form-label";
    titleLabel.textContent = "Title";
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "form-control";
    titleInput.placeholder = "Enter a title for your item";
    titleInput.required = true;
    titleGroup.append(titleLabel, titleInput);

    // Image upload
    const imageGroup = document.createElement("div");
    imageGroup.className = "form-group";
    const imageLabel = document.createElement("label");
    imageLabel.className = "form-label";
    imageLabel.textContent = "Image";
    const imageUpload = document.createElement("div");
    imageUpload.className = "image-upload-container";
    imageUpload.innerHTML = '<p>Click to upload an image or drag and drop</p>';
    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*";
    imageInput.style.display = "none";
    const imagePreview = document.createElement("img");
    imagePreview.className = "image-preview";
    imageGroup.append(imageLabel, imageUpload, imageInput, imagePreview);

    // Description
    const descGroup = document.createElement("div");
    descGroup.className = "form-group";
    const descLabel = document.createElement("label");
    descLabel.className = "form-label";
    descLabel.textContent = "Description";
    const descInput = document.createElement("textarea");
    descInput.className = "form-control description-box";
    descInput.placeholder = "Describe the item you found...";
    descInput.required = true;
    descGroup.append(descLabel, descInput);

    // Date found
    const dateGroup = document.createElement("div");
    dateGroup.className = "form-group";
    const dateLabel = document.createElement("label");
    dateLabel.className = "form-label";
    dateLabel.textContent = "Date Found";
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.className = "form-control";
    dateInput.required = true;
    dateGroup.append(dateLabel, dateInput);

    // Location
    const locationGroup = document.createElement("div");
    locationGroup.className = "form-group";
    const locationLabel = document.createElement("label");
    locationLabel.className = "form-label";
    locationLabel.textContent = "Location";
    const locationInput = document.createElement("input");
    locationInput.type = "text";
    locationInput.className = "form-control";
    locationInput.placeholder = "Where did you find the item?";
    locationInput.required = true;
    const locationPicker = document.createElement("div");
    locationPicker.className = "location-picker";
    locationPicker.innerHTML = '<p style="text-align: center; padding-top: 130px;">Map integration coming soon...</p>';
    locationGroup.append(locationLabel, locationInput, locationPicker);

    // Tags
    const tagGroup = document.createElement("div");
    tagGroup.className = "form-group";
    const tagLabel = document.createElement("label");
    tagLabel.className = "form-label";
    tagLabel.textContent = "Tags";
    const tagInput = document.createElement("input");
    tagInput.type = "text";
    tagInput.className = "form-control";
    tagInput.placeholder = "Type a tag and press Enter";
    const tagContainer = document.createElement("div");
    tagContainer.className = "tag-container";
    tagGroup.append(tagLabel, tagInput, tagContainer);

    // Anonymous listing
    const anonGroup = document.createElement("div");
    anonGroup.className = "form-check";
    const anonInput = document.createElement("input");
    anonInput.type = "checkbox";
    anonInput.id = "anonymousCheck";
    const anonLabel = document.createElement("label");
    anonLabel.htmlFor = "anonymousCheck";
    anonLabel.textContent = "Post anonymously";
    anonGroup.append(anonInput, anonLabel);

    // Submit button
    const submitBtn = document.createElement("button");
    submitBtn.className = "submit-button";
    submitBtn.textContent = "Create Post";
    submitBtn.type = "submit"; // Change to submit type

    formContainer.append(
      titleGroup,
      imageGroup,
      descGroup,
      dateGroup,
      locationGroup,
      tagGroup,
      anonGroup,
      submitBtn
    );

    this.#container.appendChild(formContainer);
  }

  #attachEventListeners() {
    const hub = EventHub.getEventHubInstance();
    const form = this.#container.querySelector(".form-container");
    
    // Image upload handling
    const imageUpload = form.querySelector(".image-upload-container");
    const imageInput = form.querySelector('input[type="file"]');
    const imagePreview = form.querySelector(".image-preview");

    imageUpload.addEventListener("click", () => imageInput.click());
    imageUpload.addEventListener("dragover", (e) => {
      e.preventDefault();
      imageUpload.style.borderColor = "#881c1c";
    });
    imageUpload.addEventListener("dragleave", () => {
      imageUpload.style.borderColor = "#dee2e6";
    });
    imageUpload.addEventListener("drop", (e) => {
      e.preventDefault();
      imageUpload.style.borderColor = "#dee2e6";
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        this.#handleImageUpload(file, imagePreview);
      }
    });
    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (file) {
        this.#handleImageUpload(file, imagePreview);
      }
    });

    // Tag handling
    const tagInput = form.querySelector('.form-group:nth-child(6) input');
    const tagContainer = form.querySelector('.tag-container');
    
    tagInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const tag = tagInput.value.trim();
        if (tag && !this.#tags.includes(tag)) {
          this.#tags.push(tag);
          this.#renderTags(tagContainer);
          tagInput.value = "";
        }
      }
    });

    // Submit handling
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titleInput = form.querySelector('.form-group:nth-child(1) input');
      const descInput = form.querySelector('.description-box');
      const dateInput = form.querySelector('input[type="date"]');
      const locationInput = form.querySelector('.form-group:nth-child(5) input');
      const anonInput = form.querySelector('#anonymousCheck');
      const submitBtn = form.querySelector(".submit-button");

      // Validate required fields
      if (!titleInput.value.trim()) {
        alert('Please enter a title');
        titleInput.focus();
        return;
      }

      if (!descInput.value.trim()) {
        alert('Please enter a description');
        descInput.focus();
        return;
      }

      if (!dateInput.value) {
        alert('Please select a date');
        dateInput.focus();
        return;
      }

      if (!locationInput.value.trim()) {
        alert('Please enter a location');
        locationInput.focus();
        return;
      }

      const initialUserId = parseInt(localStorage.getItem('userId')) || 101;
      
      try {
        // First ensure user exists
        const userResponse = await fetch(`http://localhost:3000/api/users/${initialUserId}`);
        let userId = initialUserId;

        if (!userResponse.ok) {
          // User doesn't exist, create them
          const createUserResponse = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: `user${initialUserId}`,
              email: `user${initialUserId}@umass.edu`,
              password: 'password123'
            })
          });

          const createUserResult = await createUserResponse.json();
          
          if (!createUserResponse.ok && createUserResult.message !== 'User with this email already exists') {
            throw new Error(createUserResult.message || 'Failed to create user account');
          }

          // If registration successful, use the new user's ID
          if (createUserResponse.ok && createUserResult.success) {
            userId = createUserResult.data.id;
          } else {
            // If user exists, get their ID
            const existingUserResponse = await fetch(`http://localhost:3000/api/users/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: `user${initialUserId}@umass.edu`,
                password: 'password123'
              })
            });
            
            const existingUserResult = await existingUserResponse.json();
            if (existingUserResponse.ok && existingUserResult.success) {
              userId = existingUserResult.data.id;
            }
          }
        }

        // Now create the post with the correct user ID
        const newPost = {
          title: titleInput.value.trim(),
          description: descInput.value.trim(),
          date: dateInput.value,
          location: locationInput.value.trim(),
          tags: this.#tags,
          anonymous: anonInput.checked,
          user_id: userId,
          imageUrl: null
        };

        // Disable the button while sending data
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Post...";
        
        // Send the post to the server
        const response = await fetch('http://localhost:3000/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newPost)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || `Failed to create post: ${response.status} ${response.statusText}`);
        }

        if (!result.success) {
          throw new Error(result.message || 'Failed to create post');
        }

        // Take the saved post from the server response
        const savedPost = result.data;

        // Reset form
        form.reset();
        this.#tags = [];
        this.#renderTags(tagContainer);
        imagePreview.style.display = "none";
        this.#imageFile = null;

        //new changes
        // Now publish event with the server-returned data (that has a proper ID)
        hub.publish(Events.NewPost, savedPost);
        hub.publish(Events.NavigateTo, "/HomePageSignedIn");
        alert('Post created successfully!');
      } catch (error) {
        console.error("Error creating post:", error);
        alert(error.message || "Failed to create post. Please try again.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Post";
      }
    });
  }

  #handleImageUpload(file, imagePreview) {
    if (file.type.startsWith("image/")) {
      this.#imageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  }

  #renderTags(container) {
    container.innerHTML = "";
    this.#tags.forEach(tag => {
      const tagEl = document.createElement("span");
      tagEl.className = "tag";
      tagEl.innerHTML = `${tag}<span class="remove">×</span>`;
      tagEl.querySelector(".remove").addEventListener("click", () => {
        this.#tags = this.#tags.filter(t => t !== tag);
        this.#renderTags(container);
      });
      container.appendChild(tagEl);
    });
  }
}