const messageContainer = document.getElementById("message");

const messageOpenClass = "message_open";
const messagesTypesClasses = ["message_type_error"];
const messageErrorTypeClass = messagesTypesClasses[0];

/**
 * Show a message in the app
 * @param {String} message
 * */
const showMessage = (message) => {
  const messageText = document.createElement("p");
  messageText.innerHTML = message;
  messageContainer.appendChild(messageText);
  messageContainer.classList.add(messageOpenClass, messageErrorTypeClass);
  setTimeout(() => {
    messageContainer.innerHTML = "";
    messageContainer.classList.remove(messageOpenClass);
    messagesTypesClasses.forEach((cl) => messageContainer.classList.remove(cl));
  }, 5000);
};
