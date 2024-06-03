
import { FosContextData, FosNodesData, FosTrail } from "./temp-types";



export const defaultTrail: FosTrail = [["root", "root"] as [string, string]]

export const defaultFocus = {
  route: defaultTrail,
  char: 0
}

export const defaultNodes: FosNodesData = {
  root: {
    selectedOption: 0,
    collapsed: false,
    description: "root",
    options: [{
      description: "My Goals",
      data: {},
      content: [
        ["task", "startTask"]
      ]
    }],
  },
  startTask: {
    selectedOption: 0,
    collapsed: false,
    description: "startTask",
    options: [{
      description: "",
      data: {},
      content: [
      ]
    }],
  }
}


export const defaultNodesDemo: FosNodesData = {
  root: {
    selectedOption: 0,
    collapsed: false,
    description: "root",
    options: [{
      description: "My Goals",
      data: {},
      content: [
        ["task", "startTask"]
      ]
    }],
  },
  startTask: {
    selectedOption: 0,
    collapsed: false,
    description: "startTask",
    options: [{
      description: "Learn to use fosforescent",
      data: {},
      content: [
      ]
    }],
  }

}

export const defaultNodesTest: FosNodesData = {
  root: {
    selectedOption: 0,
    collapsed: false,
    description: "root",
    options: [{
      description: "My Goals",
      data: {},
      content: [
        ["task", "task1"],
        ["task", "task2"],
        ["task", "task3"],
        // ["task", "task4"],
        // ["task5L", "task5R"]
      ]
    }],
  },


  task1: { 
    selectedOption: 0,
    description: "task1",
    collapsed: false,
    options: [{
      description: "task1a",
      data: {},
      content: [
      ["task", "task1a_1"],
      ["task", "task1a_2"],
      ["task", "task1a_3"]
      ]
    }],
  },
  task1a_1: {
    selectedOption: 0,
    description: "task1a.1",
    collapsed: false,
    options: [{
      description: "subtask1a.1a",
      data: {},
      content: [
      ]
    }],
  },
  task1a_2: {
    selectedOption: 0,
    description: "task1a.2",
    collapsed: false,
    options: [{
      description: "subtask1a.2a",
      data: {},
      content: [
      ]
    }],
  },
  task1a_3: {
    selectedOption: 0,
    description: "task1a.3",
    collapsed: false,
    options: [{
      description: "subtask1a.3a",
      data: {},
      content: [
      ]
    }],
  },

  // Task 2
  task2: {
    selectedOption: 0,
    description: "task2",
    collapsed: false,
    options: [{
      description: "task2a",
      data: {},
      content: [
        ["task", "task2a_1"],
      ]
    }],
  },
  task2a_1: {
    selectedOption: 0,
    description: "task2a.1",
    collapsed: false,
    options: [{
      description: "subtask2a.1a",
      data: {},
      content: [
        ["task", "task2a_1a_1"],
      ]
    },{
      description: "subtask2a.1b",
      data: {},
      content: [
        ["task", "task2a_1b_1"],
      ]
    },{
      description: "subtask2a.1c",
      data: {},
      content: [
        ["task", "task2a_1c_1"],
      ]
    }],
  },
  task2a_1a_1: {
    selectedOption: 0,
    description: "task2a.1a.1",
    collapsed: false,
    options: [{
      description: "subtask2.1a.1a",
      data: {},
      content: [
      ]
    }],
  },
  task2a_1b_1: {
    selectedOption: 0,
    description: "task2a.1b.1",
    collapsed: false,
    options: [{
      description: "subtask2.1b.1a",
      data: {},
      content: [
      ]
    }],
  },
  task2a_1c_1: {
    selectedOption: 0,
    description: "task2a.1c.1",
    collapsed: false,
    options: [{
      description: "subtask2.1c.1a",
      data: {},
      content: [
      ]
    }],
  },


  // Task 3

  task3: { 
    selectedOption: 0,
    description: "task3",
    collapsed: false,
    options: [{
      description: "task3",
      data: {},
      content: [
      ["task", "task3a_1"],
      ["task", "task3a_2"],
      ["task", "task3a_3"]
      ]
    }],
  },
  task3a_1: {
    selectedOption: 0,
    description: "task3a.1",
    collapsed: false,
    options: [{
      description: "subtask3a.1a",
      data: {},
      content: [
      ]
    }],
  },
  task3a_2: {
    selectedOption: 0,
    description: "task3a.2",
    collapsed: false,
    options: [{
      description: "subtask3a.2a",
      data: {},
      content: [
      ]
    }],
  },
  task3a_3: {
    selectedOption: 0,
    description: "task3a.3",
    collapsed: false,
    options: [{
      description: "subtask3a.3a",
      data: {},
      content: [
      ]
    }],
  },


}

export const defaultContext: FosContextData = {
  nodes: defaultNodes,
  trail: defaultTrail,
  focus: defaultFocus,
  previousHash: ''
}