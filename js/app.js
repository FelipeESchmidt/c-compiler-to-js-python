const codeTextarea = document.getElementById("c_code_textarea");
const compileButton = document.getElementById("compile_code_button");

const getTextAreaValue = () => {
  const code = codeTextarea.value;
  return code;
};

const compileCode = () => {
  const codeInC = getTextAreaValue();
};

compileButton.addEventListener("click", compileCode);
