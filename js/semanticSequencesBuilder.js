const semanticSequences = {
  functionCall: "WordCodeCaveTerminator",
  codeStructure: "WordCodeCaveCodeDomain",
  smallCodeStructure: "WordCodeDomain",
  doCodeStructure: "WordCodeDomainWordCodeCave",
  structCodeStructure: "WordWordCodeDomainTerminator",
};

const terminatorStepper = {
  if: 3,
  for: 3,
  switch: 3,
  while: 3,
  do: 5,
  else: 2,
  elseif: 4,
};

const endableTypes = ["Terminator", "CodeDomain"];

/**
 * Agrupa elementos pelo tipo
 * @param {{type: string}[]} elements
 * @returns {string} elementos agrupados pelo tipo
 */
const agroupElemetsType = (...elements) =>
  elements.map((el) => el.type).join("");

/**
 * Verifica se é chamada de uma função                    [Word]  [CodeCave]    [Terminator]
 * A chamada de função precisa ter a seguinte sequencia   [nome]  [argumentos]  [fim de linha]
 * @param {{type: string}} element
 * @param {{type: string}[]} inside
 * @param {number} current
 * @returns {boolean} isFunctionCallSequence
 */
const isFunctionCallSequence = (element, inside, current) => {
  if (element.type !== "CodeCave") return false;
  const prevElement = inside[current - 1];
  const nextElement = inside[current + 1];

  const sequence = agroupElemetsType(prevElement, element, nextElement);

  return sequence === semanticSequences.functionCall;
};

/**
 * Constroi objeto para chamada de função
 * @param {{ type: "CodeCave"; arguments: {type: string; value: any}[]; callee: {type: 'Identifier', name: string} }} codeCave
 * @returns {{type: "Call"; params: {type: string; value: any}[]; callee: string }}
 */
const functionCallBuilder = (codeCave) => ({
  type: "Call",
  params: codeCave.arguments,
  callee: codeCave.callee.name,
});

/**
 * Verifica se é uma estrutura de código                    [Word]    [CodeCave]    [CodeDomain]
 * A estrutura de código precisa ter a seguinte sequencia   [if|for]  [argumentos]  [bloco de codigo]
 * @param {{type: string}} element
 * @param {{type: string}[]} inside
 * @param {number} current
 * @returns {boolean} isCodeStructureSequence
 */
const isCodeStructureSequence = (element, inside, current) => {
  if (element.type !== "CodeDomain") return false;
  const prevElement = inside[current - 1];
  const doublePrevElement = inside[current - 2];

  const sequence = agroupElemetsType(doublePrevElement, prevElement, element);

  return sequence === semanticSequences.codeStructure;
};

/**
 * Verifica se if é um else if
 * @param {{ type: string; value: string }} codeCavePrevElement
 * @returns {{type: "Call"; params: {type: string; value: any}[]; callee: string }}
 */
const identifyElseIf = (codeCavePrevElement) => {
  if (!codeCavePrevElement) return false;
  if (codeCavePrevElement.type !== "Word") return false;

  const codeCavePrevElementValue = codeCavePrevElement.value.toLowerCase();

  return codeCavePrevElementValue === "else";
};

/**
 * Constroi objeto para chamada de if e elseif
 * @param {{ type: "CodeCave"; arguments: {type: string; value: any}[]; callee: {type: 'Identifier', name: string} }} codeCave
 * @param {any} processedBody
 * @param {boolean} isElseIf
 * @returns {{type: "if" | "elseif"; codition: any; body: any }}
 */
const ifCallBuilder = (codeCave, processedBody, isElseIf) => {
  return {
    type: isElseIf ? "elseif" : "if",
    condition: codeCave.arguments,
    body: processedBody,
  };
};

/**
 * Constroi objeto para chamada de while
 * @param {{ type: "CodeCave"; arguments: {type: string; value: any}[]; callee: {type: 'Identifier', name: string} }} codeCave
 * @param {any} processedBody
 * @param {boolean} isElseIf
 * @returns {{type: "while"; codition: any; body: any }}
 */
const whileCallBuilder = (codeCave, processedBody) => {
  return {
    type: "while",
    condition: codeCave.arguments,
    body: processedBody,
  };
};

/**
 * Constroi objeto para chamada de for
 * @param {{ type: "CodeCave"; arguments: {type: string; value: any}[]; callee: {type: 'Identifier', name: string} }} codeCave
 * @param {any} processedBody
 * @param {boolean} isElseIf
 * @returns {{type: "for"; codition: any; body: any }}
 */
const forCallBuilder = (codeCave, processedBody) => {
  return {
    type: "for",
    condition: codeCave.arguments,
    body: processedBody,
  };
};

/**
 * Constroi objeto para bloco de switch
 * @param {{ type: "CodeCave"; arguments: {type: string; value: any}[]; callee: {type: 'Identifier', name: string} }} codeCave
 * @param {any} processedBody
 * @param {boolean} isElseIf
 * @returns {{type: "switch"; codition: any; body: any }}
 */
const switchCallBuilder = (codeCave, cases) => {
  return {
    type: "switch",
    condition: codeCave.arguments,
    body: cases,
  };
};

/**
 * Verifica se é uma estrutura de código sem argumentos     [Word]     [CodeDomain]
 * A estrutura de código precisa ter a seguinte sequencia   [else|do]  [bloco de codigo]
 * @param {{type: string}} element
 * @param {{type: string}[]} inside
 * @param {number} current
 * @returns {boolean} isSmallCodeStructureSequence
 */
const isSmallCodeStructureSequence = (element, inside, current) => {
  if (element.type !== "CodeDomain") return false;
  const prevElement = inside[current - 1];

  const sequence = agroupElemetsType(prevElement, element);

  return sequence === semanticSequences.smallCodeStructure;
};

/**
 * Constroi objeto para chamada de else
 * @param {any} processedBody
 * @returns {{type: "else"; codition: any; body: any }}
 */
const elseCallBuilder = (processedBody) => {
  return {
    type: "else",
    body: processedBody,
  };
};

/**
 * Verifica se é uma estrutura de uma struct                 [Word]    [CodeDomain]        [Word]    [CodeCave]
 * A estrutura de código precisa ter a seguinte sequencia    [do]      [bloco de codigo]   [while]   [bloco de codigo]
 * @param {{type: string}} element
 * @param {{type: string}[]} inside
 * @param {number} current
 * @returns {boolean} isCodeStructureSequence
 */
const isDoCodeStructureSequence = (element, inside, current) => {
  if (element.type !== "CodeDomain") return false;
  const prevElement = inside[current - 1];
  const nextElement = inside[current + 1];
  const doubleNextElement = inside[current + 2];

  const sequence = agroupElemetsType(
    prevElement,
    element,
    nextElement,
    doubleNextElement
  );

  return sequence === semanticSequences.doCodeStructure;
};

/**
 * Constroi objeto para chamada de do
 * @param {any} processedBody
 * @returns {{type: "do"; codition: any; body: any }}
 */
const doCallBuilder = (codeCave, processedBody) => {
  return {
    type: "do",
    condition: codeCave.arguments,
    body: processedBody,
  };
};

/**
 * Verifica se é uma estrutura de código do                 [Word]      [Word]            [CodeDomain]
 * A estrutura de código precisa ter a seguinte sequencia   [struct]    [nome da struct]  [bloco de codigo]
 * @param {{type: string}} element
 * @param {{type: string}[]} inside
 * @param {number} current
 * @returns {boolean} isStructCodeStructureSequence
 */
const isStructCodeStructureSequence = (element, inside, current) => {
  if (element.type !== "CodeDomain") return false;
  const prevElement = inside[current - 1];
  const doublePrevElement = inside[current - 2];
  const nextElement = inside[current + 1];

  const sequence = agroupElemetsType(
    doublePrevElement,
    prevElement,
    element,
    nextElement
  );

  return sequence === semanticSequences.structCodeStructure;
};

/**
 * Constroi objeto para chamada de struct
 * @param {any} processedBody
 * @returns {{type: "struct"; codition: any; body: any }}
 */
const structCallBuilder = (structName, processedBody) => {
  return {
    type: "struct",
    name: structName,
    body: processedBody,
  };
};

/**
 * Constroi objeto para um statement
 * @param {any} processedBody
 * @returns {{type: "Statement"; codition: any; body: any }}
 */
const statementBuilder = (value) => {
  return {
    type: "Statement",
    value,
  };
};
