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
  const tokensParsed = syntacticAnalysis(tokens);
  console.log(tokensParsed);
};

compileButton.addEventListener("click", compileCode);
