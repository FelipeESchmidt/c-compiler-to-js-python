/**
 * Valida as estruturas da AST 'Abstract Syntax Tree' e gera uma AST ainda mais completa
 * @param {{
 * type: "Program",
 * body: ({ type: string; value: string; } |
 *        { type: "Function"; expression: { arguments: { type: string; value: string; }[]; type: string; callee?: { type: 'Identifier', name: string } } } |
 *        { type: "CodeCave"; params: { type: string; value: string; }[]; name: string; value: string; } |
 *        { type: "CodeDomain"; params: { type: string; value: string; }[]; value: string; })[]
 * }} ast
 * */
const processor = (ast) => {
  // Iniciamos buscando os Statements globais como variáveis globais, structs, includes
  const globalStatements = findGlobalStatements(ast.body);

  // Aqui tentamos pré-processar as declarações globais para reordenar e melhorar sua estrutura de macro
  const globalStatementsProcessed = processGlobalStatements(globalStatements);

  const globalItem = {
    type: "GlobalStatements",
    body: globalStatementsProcessed,
  };

  // Aqui buscamos as funções do código e organizamos melhor as informações da função
  const codeFunctions = findFuncs(ast.body);

  // Após buscar as funções processamos o body e arrumamos os argumentos
  const codeFunctionsProcessed = codeFunctions.map((codeFunction) => ({
    ...codeFunction,
    body: processBody(codeFunction.body),
    args: updateFunctionArguments(codeFunction.args),
  }));

  const functionPack = {
    type: "Functions",
    body: codeFunctionsProcessed,
  };
  // At the end, we'll define our final abstract syntax tree structure and name it TheBigAST:)
  // and push our 2 top level arrays: globalItems and functionPack into it.
  // TheBigAST will then be ready to be compiled
  const TheBigAST = [globalItem, functionPack];

  return TheBigAST;
};

/**
 * Busca retornar coisas globais como variáveis globais, structs, includes
 * @param {({ type: string; value: string; } |
 *        { type: "CodeCave"; params: { type: string; value: string; }[]; name: string; value: string; } |
 *        { type: "CodeDomain"; params: { type: string; value: string; }[]; value: string; })[]} astBody
 * */
const findGlobalStatements = (astBody) => {
  const astBodyClone = [...astBody];

  // Percorremos o corpo até encontrar um ; ou um # como primeiro caractere
  let current = 0;
  const globalStatements = [];

  while (current < astBodyClone.length) {
    // Buscando por linhas que começam com #
    if (astBodyClone[0].type === "Macro") {
      if (astBodyClone[1].value === "include") {
        let cutIndex;
        // Encontrou um '#include "arquivo.file"
        if (astBodyClone[2].type === "StringLiteral") cutIndex = 3;
        // Encontrou um '#include <arquivo.h>
        else {
          const greaterIndex = astBodyClone.findIndex(
            (item) => item.type === "Greater"
          );
          cutIndex = greaterIndex + 1;
        }

        globalStatements.push({
          type: "Macro",
          value: astBodyClone.splice(0, cutIndex),
        });
        current = 0;
      }

      // Encontrou definição de variável
      if (astBodyClone[1].value === "define") {
        let cutIndex = 4;

        if (astBodyClone[4].type === "Dot") cutIndex += 2;

        globalStatements.push({
          type: "Define",
          value: astBodyClone.splice(0, cutIndex),
        });
        current = 0;
      }
    }

    // Caso encontre um ;
    if (astBodyClone[current].type === "Terminator") {
      const statement = [];

      for (let i = 0; i < current + 1; i++) {
        // Caso encontre uma definição de uma struct
        if (astBodyClone[i].value === "struct") {
          // Processa o corpo da struct como se fosse uma sequencia
          const instruct = processBody(
            astBodyClone[i + 2].expression.arguments
          );

          globalStatements.push({
            type: "Struct",
            name: astBodyClone[i + 1].value,
            body: instruct,
          });
          i += 4;
        } else {
          statement.push(astBodyClone[i]);
        }
      }

      // Remove todos itens que foram percorridos
      astBodyClone.splice(0, current + 1);

      // Adiciona o Statement encontrado
      if (statement.length !== 0) {
        globalStatements.push({
          type: "Statement",
          value: statement,
        });
      }
      current = 0;
    }
    current++;
  }

  return globalStatements;
};

/**
 * Melhora as estruturas de #include e #define
 * @param {{type: string; value: {type: string; value: string}[]}[]} globalStatements
 * @returns
 */
const processGlobalStatements = (globalStatements) => {
  /**
   * Melhora estrutura do #include adicionando o nome do arquivo
   * @param {{type: string; value: {type: string; value: string}[]}} globalStatement
   * @returns
   */
  const betterIncludeStatement = (globalStatement) => {
    const macroValue = globalStatement.value;
    // Começa no item 3 e remove o '<' e o '>'
    const fileName = macroValue
      .slice(2, macroValue.length)
      .filter(({ type }) => type !== "Less" && type !== "Greater")
      .map(({ value }) => value)
      .join("");

    return {
      type: globalStatement.type,
      subtype: "include",
      file: fileName,
    };
  };

  /**
   * Melhora estrutura do #define adicionando o nome da constante e seu valor
   * @param {{type: string; value: {type: string; value: string}[]}} globalStatement
   * @returns
   */
  const betterDefineStatement = (globalStatement) => {
    const macroValue = globalStatement.value;
    // Busca o nome da constante, o tipo e o valor
    const constantName = macroValue[2].value;
    const constantType = macroValue[3].type;
    const constantValue = macroValue
      .slice(3, macroValue.length)
      .map(({ value }) => value)
      .join("");

    return {
      type: globalStatement.type,
      subtype: "constant",
      variable: constantName,
      variableValue: constantValue,
      variableType: constantType,
    };
  };

  const betterers = {
    Macro: betterIncludeStatement,
    Define: betterDefineStatement,
  };

  return globalStatements.map((globalStatement) =>
    betterers[globalStatement.type]
      ? betterers[globalStatement.type](globalStatement)
      : globalStatement
  );
};

/**
 * Busca retornar as funções do programa e reorganiza elas
 * @param {({ type: string; value: string; } |
 *        { type: "Function"; expression: { arguments: { type: string; value: string; }[]; type: string; callee?: { type: 'Identifier', name: string } } } |
 *        { type: "CodeCave"; params: { type: string; value: string; }[]; name: string; value: string; } |
 *        { type: "CodeDomain"; params: { type: string; value: string; }[]; value: string; })[]} astBody
 * */
const findFuncs = (astBody) => {
  const functions = [];

  // Percorre toda a AST
  for (let i = 0; i < astBody.length; i++) {
    if (
      astBody[i].type === "Function" &&
      astBody[i].expression.hasOwnProperty("callee") &&
      astBody[i].expression.callee.type === "Identifier"
    ) {
      // A função precisa ter a seguinte sequencia  [retorno]  [nome]  [argumentos|callee|]   [body|CodeDomain|]
      // Verifica se é a definição de uma função    [Word]     [Word]  [Function]             [Function]
      const functionSequence = astBody.slice(i - 2, i + 2);

      if (
        functionSequence[0].type === "Word" &&
        functionSequence[1].type === "Word" &&
        functionSequence[3].type === "Function" &&
        functionSequence[3].expression.type === "CodeDomain"
      ) {
        const isMain = functionSequence[2].expression.callee.name === "main";
        functions.push({
          type: isMain ? "EntryPoint" : "FunctionDefinition",
          name: functionSequence[2].expression.callee.name,
          args: functionSequence[2].expression.arguments,
          body: functionSequence[3].expression.arguments,
          returnType: functionSequence[0].value,
        });
      } else {
        throw new TypeError(
          `Função ${functionSequence[2].expression.callee.name} não atende os requisitos de uma função`
        );
      }
    }
  }

  // Retorna as funções encontradas e organizadas
  return functions;
};

// Esta função processa os cases de um switch
const processSwitch = (inside, current) => {
  let count = 0;
  const cases = [];
  const args = inside[current].arguments;
  const codeCave = inside[current - 1];
  args.reverse();
  let reverseCaseParts = [];
  while (count < args.length) {
    if (args[count].type !== "Colon") {
      reverseCaseParts.push(args[count]);
    } else {
      const currentCaseType = args[count + 1].type;
      const currentCaseValue = args[count + 1].value;
      const currentStatementsGroup = reverseCaseParts.reverse();
      if (args[count + 1].value === "default") {
        count++;
      } else if (args[count + 2].value === "case") {
        count += 2;
      }
      reverseCaseParts = [];
      const caseStatements = processBody(currentStatementsGroup);
      cases.unshift({
        caseType: currentCaseType,
        caseValue: currentCaseValue,
        caseStatements: caseStatements,
      });
    }
    count++;
  }

  return switchCallBuilder(codeCave, cases);
};

// Esta função processa o body montando e validando as sequencias
const processBody = (inside) => {
  const statements = [];

  let current = 0;

  let start = 0;

  const pushStatement = (statement, increaseCurrent = true) => {
    statements.push(statement);
    if (increaseCurrent) current++;
  };

  while (current < inside.length) {
    const part = inside[current];

    if (isFunctionCallSequence(part, inside, current)) {
      pushStatement(functionCallBuilder(part));
      continue;
    }

    if (isCodeStructureSequence(part, inside, current)) {
      const codeCave = inside[current - 1];
      const codeStructureType = inside[current - 2].value.toLowerCase();

      switch (codeStructureType) {
        case "if":
          {
            const isElseIf = identifyElseIf(inside[current - 3]);
            pushStatement(
              ifCallBuilder(codeCave, processBody(part.arguments), isElseIf)
            );
          }
          break;

        case "while":
          pushStatement(
            whileCallBuilder(codeCave, processBody(part.arguments))
          );
          break;

        case "for":
          pushStatement(forCallBuilder(codeCave, processBody(part.arguments)));
          break;

        case "switch":
          pushStatement(processSwitch(inside, current));
          break;

        default:
          throw new TypeError("Sintaxe inválida!");
      }

      continue;
    }

    if (isSmallCodeStructureSequence(part, inside, current)) {
      const codeStructureType = inside[current - 1].value.toLowerCase();

      if (codeStructureType === "else") {
        pushStatement(elseCallBuilder(processBody(part.arguments)));
        continue;
      }

      if (isDoCodeStructureSequence(part, inside, current)) {
        const codeCave = inside[current + 2];
        pushStatement(doCallBuilder(codeCave, processBody(part.arguments)));
        current += 2; // Pula até o while
        continue;
      }
    }

    if (isStructCodeStructureSequence(part, inside, current)) {
      const prevElement = inside[current - 1];
      const doublePrevElement = inside[current - 2];
      if (doublePrevElement.value === "struct") {
        pushStatement(
          structCallBuilder(prevElement.value, processBody(part.arguments))
        );
        continue;
      }
      throw new TypeError("Sintaxe inválida!");
    }

    if (part.type === "Terminator") {
      const phrase = [];

      while (start <= current) {
        const currentInsideStart = inside[start];
        if (
          currentInsideStart.type === "Word" &&
          terminatorStepper[currentInsideStart.value]
        ) {
          start += terminatorStepper[currentInsideStart.value];
          continue;
        }

        if (
          currentInsideStart.type === "Word" &&
          inside[start + 1].type === "CodeCave"
        ) {
          start += 3;
          continue;
        }

        phrase.push({
          type: currentInsideStart.type,
          value: currentInsideStart.value,
        });
        start++;
      }

      if (phrase.length) pushStatement(statementBuilder(phrase), false);
    }

    const lastItem = current === inside.length - 1;

    if (lastItem && !endableTypes.includes(part.type)) {
      throw new TypeError("Seu código possui um erro em algum lugar!");
    }

    current++;
    continue;
  }

  return statements;
};

/**
 * Função ajusta os argumentos de uma função
 * @param {any[]} cave
 * @returns
 */
const updateFunctionArguments = (cave) => {
  if (!cave.length) return [];

  const reducedArgs = cave.reduce(
    (prev, current) => {
      if (current.type === "Delimiter") return [...prev, []];

      prev[prev.length - 1].push(current);
      return prev;
    },
    [[]]
  );

  const params = reducedArgs.map((reducedArg) => {
    const argumentType = reducedArg.shift();

    const argumentName = reducedArg.find((arg) => arg.type === "Word");

    return {
      type: argumentType.value,
      name: argumentName.value,
    };
  });

  return params;
};
