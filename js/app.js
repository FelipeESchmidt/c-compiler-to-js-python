const codeTextarea = document.getElementById("c_code_textarea");
const compiledCodeTextarea = document.getElementById("compiled_code_textarea");
const compileJSButton = document.getElementById("compile_code_to_js_button");
const compilePYButton = document.getElementById("compile_code_to_py_button");
const exampleJSButton = document.getElementById("js_example");
const examplePYButton = document.getElementById("py_example");
const clearCodeButton = document.getElementById("clear_code");

/**
 * Get textarea value
 * @return {String} code
 * */
const getTextAreaValue = () => {
  const code = codeTextarea.value;
  return code;
};

const compileTo = (language) => {
  compiledCodeTextarea.value = "";
  codeTextarea.setAttribute("lan", language);
  try {
    compileCode();
  } catch (error) {
    showMessage(error.message);
  }
};

const compileCode = () => {
  const codeInC = getTextAreaValue();
  const tokens = lexicalAnalysis(codeInC);
  const tokensParsed = syntacticAnalysis(tokens);
  const tokensStructured = syntacticAnalysis2(tokensParsed);
  const processedCode = processor(tokensStructured);
  const compiled = codeGenerator(processedCode);
  compiledCodeTextarea.value = compiled;
};

compileJSButton.addEventListener("click", () => compileTo("js"));
compilePYButton.addEventListener("click", () => compileTo("py"));

exampleJSButton.addEventListener("click", () => {
  codeTextarea.value = jscode;
  compiledCodeTextarea.value = "";
});
examplePYButton.addEventListener("click", () => {
  codeTextarea.value = pycode;
  compiledCodeTextarea.value = "";
});
clearCodeButton.addEventListener("click", () => {
  codeTextarea.value = "";
  compiledCodeTextarea.value = "";
});
