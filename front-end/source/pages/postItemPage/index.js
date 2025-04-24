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
    const formContainer = document.createElement("div");
    formContainer.className = "form-container";

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
    submitBtn.type = "button";

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
    const submitBtn = form.querySelector(".submit-button");
    submitBtn.addEventListener("click", () => {
      const titleInput = form.querySelector('.form-group:nth-child(1) input');
      const descInput = form.querySelector('.description-box');
      const dateInput = form.querySelector('input[type="date"]');
      const locationInput = form.querySelector('.form-group:nth-child(5) input');
      const anonInput = form.querySelector('#anonymousCheck');

      const newPost = {
        id: Date.now().toString(),
        title: titleInput.value,
        description: descInput.value,
        date: dateInput.value,
        location: locationInput.value,
        tags: this.#tags,
        anonymous: anonInput.checked,
        image: this.#imageFile ? URL.createObjectURL(this.#imageFile) : null
      };

      hub.publish(Events.NewPost, newPost);
      hub.publish(Events.NavigateTo, "/HomePageSignedIn");
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