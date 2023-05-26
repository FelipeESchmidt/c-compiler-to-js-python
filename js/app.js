const codeTextarea = document.getElementById("c_code_textarea");
const compileButton = document.getElementById("compile_code_button");

/**
 * Get textarea value
 * @return {String} code
 * */
const getTextAreaValue = () => {
  const code = codeTextarea.value;
  return code;
};

const compileCode = () => {
  const codeInC = getTextAreaValue();
  const tokens = lexicalAnalysis(codeInC);
  console.log(tokens);
};

compileButton.addEventListener("click", compileCode);
