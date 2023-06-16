const classLineTransform = (line) => {
  line.value.pop();
  line.value.shift();
  const variableName = line.value.map((lv) => lv.value).join(" ");
  return `this.${variableName} = ''`;
};

const mountIfCondition = (lineIf) => {
  return lineIf.condition.map((lIf) => lIf.value).join(" ");
};

const mountBlockCondition = (lineBlock) => {
  return lineBlock.condition.map((lIf) => lIf.value).join(" ");
};

const functionCalleeTransform = (functionCallee) => {
  if (functionCallee.callee === "printf") {
    if (functionCallee.params[0].type === "StringLiteral") {
      const printableString = functionCallee.params.shift().value;
      const variables = functionCallee.params.reduce((acc, currentItem) => {
        if (currentItem.type === "Word" || currentItem.type === "Dot") {
          acc[acc.length - 1] += currentItem.value;
        } else if (currentItem.type === "Delimiter") {
          acc.push("");
        }
        return acc;
      }, []);
      const replaced = printableString.replace(
        /%[a-zA-Z]/g,
        () => `\$\{${variables.shift()}\}`
      );
      return `console.log(\`${replaced}\`)`;
    }
  }
  if (functionCallee.callee === "scanf") {
    const type = functionCallee.params.shift().value;
    const variable = functionCallee.params.pop().value;

    switch (type) {
      case "%d":
        return `${variable} = ${Math.floor(Math.random() * 100)}`;

      case "%f":
        return `${variable} = ${Math.random() * 100}`;

      default:
        return `${variable} = "${Array.from({ length: 10 })
          .map(() =>
            characters.charAt(Math.floor(Math.random() * characters.length))
          )
          .join("")}"`;
    }
  }

  const parsedParams = functionCallee.params.map((param) => {
    if (param.type == "StringLiteral")
      return { ...param, value: `"${param.value}"` };
    return param;
  });

  return `${functionCallee.callee}(${parsedParams
    .map((param) => param.value)
    .join("")})`;
};

const lineTransform = (line) => {
  if (line.type === "Macro") {
    return `//${line.subtype} "${line.file}.js"`;
  }
  if (line.type === "Define") {
    const isString = line.variableType === "StringLiteral";
    const aroundValueChar = isString ? `"` : "";
    return `const ${line.variable} = ${aroundValueChar}${line.variableValue}${aroundValueChar}`;
  }
  if (line.type === "Statement") {
    line.value.pop();
    const firstStatementItem = line.value[0];
    const isClassInitiator = isStructInitiator(firstStatementItem);
    const isStringInitiator = isVariableInitiator(firstStatementItem);
    const isReturn = isReturnInitiator(firstStatementItem);
    const stringInitiator = isStringInitiator ? "let " : "";

    if (stringInitiator || isClassInitiator) line.value.shift();

    if (isClassInitiator) {
      const variableName = line.value.pop().value;
      return `let ${variableName} = new ${line.value[0].value}()`;
    }

    if (isReturn) {
      line.value.splice(1, 0, { value: " " });
    }
    return `${stringInitiator}${line.value.map((lv) => lv.value).join("")}`;
  }
  if (line.type === "Struct") {
    return [
      `class ${line.name} {`,
      `\t${line.name}(){`,
      ...line.body.map((l) => `\t\t${classLineTransform(l)}`),
      "\t}",
      "}",
    ].join("\n");
  }
  if (line.type === "if") {
    return [
      `if (${mountIfCondition(line)}) {`,
      ...line.body.map((l) => `\t${lineTransform(l)}`),
      "}",
    ].join("\n");
  }
  if (line.type === "elseif") {
    return [
      `else if (${mountIfCondition(line)}) {`,
      ...line.body.map((l) => `\t${lineTransform(l)}`),
      "}",
    ].join("\n");
  }
  if (line.type === "else") {
    return [
      `else {`,
      ...line.body.map((l) => `\t${lineTransform(l)}`),
      "}",
    ].join("\n");
  }
  if (line.type === "for") {
    return [
      `for (${mountBlockCondition(line)}) {`,
      ...line.body.map((l) => `\t${lineTransform(l)}`),
      "}",
    ].join("\n");
  }
  if (line.type === "while") {
    return [
      `while (${mountBlockCondition(line)}) {`,
      ...line.body.map((l) => `\t${lineTransform(l)}`),
      "}",
    ].join("\n");
  }
  if (line.type === "Call") {
    return functionCalleeTransform(line);
  }
  console.log(line);
  return "";
};

const functionTransform = (f) => {
  const functionLines = [
    `const ${f.name} = (${f.args.map((fArgs) => fArgs.name).join(",")}) => {`,
    ...f.body.map((l) => `\t${lineTransform(l)}`),
    `}`,
  ];

  return functionLines;
};

const codeGenerator = ([globalStatements, functions]) => {
  const codeLines = [];

  globalStatements.body.forEach((line) => {
    codeLines.push(lineTransform(line));
  });

  functions.body.forEach((f) => {
    codeLines.push(...functionTransform(f));
  });

  return codeLines.join("\n");
};
