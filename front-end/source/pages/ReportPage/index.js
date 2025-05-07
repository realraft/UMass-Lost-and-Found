import { BasePage } from "../BasePage/BasePage.js";
import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";

export class ReportPage extends BasePage {
  #container = null;
  #postData = null;

  constructor() {
    super();
    this.loadCSS("pages/ReportPage", "ReportPage");
  }

  setPostData(postData) {
    this.#postData = postData;
  }

  render() {
    document.body.className = 'report-page';
    
    if (this.#container) {
      this.#updateContent();
      return this.#container;
    }
    
    this.#container = document.createElement("div");
    this.#container.className = "report-page-container";
    
    this.#setupContainerContent();
    return this.#container;
  }
  
  #setupContainerContent() {
    if (!this.#container) return;
    
    const title = document.createElement("h2");
    title.className = "report-page-title";
    title.textContent = "Report a Listing";
    
    const reportForm = document.createElement("div");
    reportForm.className = "report-form";
    
    if (this.#postData) {
      // Create post details section
      const postDetails = this.#createPostDetailsSection();
      
      // Create report form elements
      const form = this.#createReportForm();
      
      reportForm.append(postDetails, form);
    } else {
      const errorMsg = document.createElement("p");
      errorMsg.className = "error-message";
      errorMsg.textContent = "No post data available. Please select a post to report.";
      
      const backButton = document.createElement("button");
      backButton.textContent = "Back to Listings";
      backButton.addEventListener("click", () => {
        EventHub.getEventHubInstance().publish(Events.NavigateTo, "home");
      });
      
      reportForm.append(errorMsg, backButton);
    }
    
    this.#container.append(title, reportForm);
  }
  
  #updateContent() {
    // Clean the container
    this.#container.innerHTML = "";
    // Re-create content
    this.#setupContainerContent();
  }
  
  #createPostDetailsSection() {
    const postDetails = document.createElement("div");
    postDetails.className = "post-details";
    
    const title = document.createElement("h3");
    title.textContent = this.#postData.title || "Untitled";
    
    const details = [
      { label: "Date found: ", text: this.#postData.date || "Not supplied" },
      { label: "Description: ", text: this.#postData.description || "Not supplied" },
      { label: "Tags: ", text: this.#postData.tags?.length > 0 ? this.#postData.tags.join(", ") : "Not supplied" },
      { label: "Location: ", text: this.#postData.location || "Not supplied" }
    ];
    
    const detailElements = details.map(detail => {
      const p = document.createElement("p");
      p.textContent = detail.label;
      
      const span = document.createElement("span");
      span.textContent = detail.text;
      
      p.appendChild(span);
      return p;
    });
    
    postDetails.append(title, ...detailElements);
    return postDetails;
  }
  
  #createReportForm() {
    const formContainer = document.createElement("div");
    
    const reasonLabel = document.createElement("label");
    reasonLabel.htmlFor = "report-reason";
    reasonLabel.textContent = "Reason for Report:";
    
    const reasonTextarea = document.createElement("textarea");
    reasonTextarea.id = "report-reason";
    reasonTextarea.placeholder = "Please explain why you are reporting this listing...";
    
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    
    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit Report";
    submitButton.addEventListener("click", () => this.#submitReport(reasonTextarea.value));
    
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.className = "cancel-button";
    cancelButton.addEventListener("click", () => {
      EventHub.getEventHubInstance().publish(Events.NavigateTo, "home");
    });
    
    buttonContainer.append(cancelButton, submitButton);
    formContainer.append(reasonLabel, reasonTextarea, buttonContainer);
    
    return formContainer;
  }
  
  #submitReport(reason) {
    if (!reason.trim()) {
      alert("Please provide a reason for reporting this listing.");
      return;
    }
    
    const post_id = this.#postData.id;
    const reported_by = localStorage.getItem('userId') || '101';
    
    fetch('http://localhost:3000/api/admin/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_id,
        reason,
        reported_by
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Publish the NewReport event with the report data
        EventHub.getEventHubInstance().publish(Events.NewReport, data.data);
        this.#showSuccessMessage();
      } else {
        throw new Error(data.message || 'Failed to report post');
      }
    })
    .catch(error => {
      console.error('Error reporting post:', error);
      alert('Failed to report post. Please try again later.');
    });
  }
  
  #showSuccessMessage() {
    // Clear the form and show success message
    this.#container.innerHTML = "";
    
    const title = document.createElement("h2");
    title.className = "report-page-title";
    title.textContent = "Report Submitted";
    
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = "Thank you for your report. It has been submitted successfully and will be reviewed by our administrators.";
    
    const backButton = document.createElement("button");
    backButton.textContent = "Back to Listings";
    backButton.style.marginTop = "20px";
    backButton.addEventListener("click", () => {
      EventHub.getEventHubInstance().publish(Events.NavigateTo, "home");
    });
    
    this.#container.append(title, successMessage, backButton);
  }
}