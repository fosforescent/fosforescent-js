- [Basics:](#basics)
- [Tasks:](#tasks)
- [Types:](#types)
- [Initial proposal for operational semantics:](#initial-proposal-for-operational-semantics)
  - [Data Constructors](#data-constructors)
  - [Patterns:](#patterns)
  - [Retrieving previously stored nodes using queries:](#retrieving-previously-stored-nodes-using-queries)

## Basics:
The initial intention was to make a todo app which can seamlessly turn into a sophisticated programming language as nested subtasks become more sophisticated.  To this end, we need to consider what is possible to represent in a todo-app style interface.  For this reason, expressions are lists of 2-tuples, which are sufficient to store the information required to construct the DAG, but simple enough to be displayed in a way that can be modified.

Currently the left side is used for "instructions" and data constructors, however this might switch in the future as the semantics are solidified.  Similarly, the right side is referred to as the "target" node.  The target node is usually meant to perform something equivalent to what a function's argument does in a normal language.  If both of these pairs are native nodes, then there should be defined rewrite rules for the resulting edge(s) upon evaluation.  

## Tasks: 
In fosforesecent, tasks are a recursive data type which can have any number of children, which represent subtasks.  A task expression is composed of the "task" data constructor term on the left (might switch ) (referred to as "allOf" in some instances of the codebase). 

Upon execution, the interpreter of an expression on the root node with no more dependencies should: 
- log metadata 
- create or modify a data constructor or assignment node on the root node
- remove the expression from the root node

Currently, options--i.e. tasks with more than one choice--are considered separate "oneOf" nodes.  However this logic should ultimately instead be mediated as sum type data constructors.  In the future, a critical piece will be allowing this to be defined automatically, allowing for the basic control flow required for a programming language. 

## Types:
The type which a task expression returns should be inferrable by the instruction element of its 2-tuple.  For instance if the type is `task` then this would be inferred from the `task` data constructor in its node.  If it should return, for instance, a `Nat` this should be inferrable by a `succ` data constructor. 


## Initial proposal for operational semantics:

The content addressed graph we are given is described in [dag-implementation](./dag-implementation/). 

The ultimate goal is to provide a simple interface where your semantics can simply be another node in the graph that is arrived upon through collaboratively editing these nodes in the graph.  The problem is that inherent in providing that interface, I have to create some semblance of semantics.  

This is an area where frankly I'm not an expert, so I'm doing research to learn this as fast as I can.  I think interaction nets are a promising direction, but I don't have the bandwidth to integrate those right now and verify that it's the right direction to take.  As such, I'm trying to dance around this until I get something I can release to people with a better grasp than me.  In the meantime, I'm working to provide some sort of hard-coded task execution semantics that can provide the basis for using this as a personal workflow engine until a better semantics is found.  

The nodes of the graph are lists of edges.  The edges are 2-tuples consisting of the "edge type" (or "instruction") node and the "target" node, both of which must exist in the graph.  Currently there are some "native" nodes as well, but these are there for implementation convenience and can be progressively removed in the long run.   

Each edge of a node can be considered an expression.  These expressions are evaluated via graph reduction.  The "edge type" correponds to the function to be applied, and the "target" corresponds to the input. See below:

```
instruction1:
  ...: ...
input1:
  ...: ...
myNode1: 
  instruction1: input1
```

the names of the nodes are there for convenience.  In the tree these would be stored and referred to based on their ID or positional elements.  Here `myNode1` represents a node, and `instruction1: input1` is an edge.  `instruction1` and `input1` must also exist in the graph for this to be a valid state.  One might be able to recognize that an initial empty node with no edges must be created.  I have referred to this as the `void` node or the `empty` node in my code.  However depending on the semantics it may or may not correspond to traditional uses of that word, so perhaps another name might be more appropriate.  Once the empty node is created, the only new node that can be created must use that empty node for both sides of the expression.  I have referred to this as the `unit` node in my code, however since the semantics aren't nailed down, it's unclear how closely it would resemble the `unit` that people are familiar with, so might be better renamed.  


### Data Constructors
---
A data constructor is an edge type which can be used to create a pattern representing the next available/required edge types, if any. 

It is also a type of pattern which validates when the target consists of or outputs valid following type constructors

A type constructor on the left side of an expression will represent an operation upon the instance of that datatype coming from the right side.  

For instance
```
MyNode: 
  succ: myNumber
```
here "succ" is a type constructor which is adding a succ to the myNumber datastructure which represents a peano number

A type constructor on the right side is either a termination of same structure representing the peano number, e.g.
```
One:
  succ: void
```
Or it is a continuation of the same data structure, now representing an operation which requires input, e.g.
```
AddTwo:
  succ: succ
```
Or it could take a node representing any expression which satisfies the same pattern, e.g.
```
MyThreeExpr:
  AddTwo: One
```
...which should ultimately resolve to 
```
Three: 
  succ: Two
Two:
  succ: One
One:
  succ: void
```



### Patterns:
---

A pattern is a node which can be used to 

(1) ensure that a target node it is applied to has an appropriate structure 
(2) once validated, extract information from the target node.
(3) A pattern node which is applied to a target that does not complete the pattern instead produces a new pattern representing the missing/invalid info

If an appropriate type constructor precedes a pattern falling into case (3), then the type constructor / pattern combo represents a "closure"

Pattern matching for control flow

```
instruction1inputPattern1:
  ...: ...
instruction1inputPattern2:
  ...: ...
input1:
  ...: ...
myNode1: 
  instruction1: input1
instruction1: 
  instruction2: instruction1inputPattern1
  instruction3: instruction1inputPattern2
```

The "instruction" node,  as you might guess from the name represents the instruction to apply to the "input" argument, which is the target node.  In attempting to reduce the graph, the nodes are substituted such that `myNode1` would expand to this (logically, not as stored in the store) 
```
myNode1:
  instruction2: instruction1Pattern1: input1
  instruction3: instruction1Pattern2: input1
```

we can then imagine 4 scenarios, 
(A) input1 matches neither instruction1Pattern1 nor instruction.  In this case, myNode1 would be replaced with the empty node.
(B/C) input matches only instruction1Pattern1 or instruction1Pattern2, in which case the resulting pattern + input combination would become the input to the corresponding instruction, and the resulting node could be substituted for any place where myNode1 is referenced.
(D) input1 matches both patterns.  In this case, myNode1 simply keeps both edges, and the corresponding node is provided in any situations where myNode1 is referenced. 

Based on these semantics, a reference to the "void" node as the input would prevent an instruction from executing further.  a reference to the "penult" node as the input would allow execution to continue for any input. 

This pattern matching allows a semblance of control flow. The independence of reduction of any given edge/tuple on its neighbors allows parallelism.

The content addressing prevents cycles and mutations, however they can be added back in via the query mechanism.  One way is to assign a name to a node by creating a "name" edge with a target to a certain node representing the name string.  Removing such an edge from one node and moving it to another allows the query to find a different node.  In other words to follow a mutation.  Since the query instruction's cannot target the same root node that it is a part of, it can't have exactly up to date information, but it can query the most recent root if a pointer points to the previous root node.  This pointer is also the basis of a block.  So this inherently forms a blockchain.  There are many strategies to prevent conflicting instances of this kind of mutation, however one way I'd like to note is to take both conflicting mutations as "options," whereby the nodes representing the continuations of each proposed mutation are added with a "void" input so execution stops.  A peer then proposes a new block with one mutation provided a "unit" input in order to indicate their choice.  This proposed new block is broadcast to the other nodes and they provide their approval or not based on whatever consensus mechanism the group uses for resolving these sorts of "options."  In some ways this similar to merge conflict resolution. 



### Retrieving previously stored nodes using queries:
---

The store's query function accepts a root node, and a pattern node.  The application of the query + pattern node to the root node will result in either a list of edges which match that pattern from the target nodes
 

For example, let's say we have a program

*Main*: 
  showPerson{IO}: Bob
  showPerson{IO}: Alice
*Bob*:
  name: String("Bob")
*Alice*:
  id: Number(3)
*showPerson*:
  #dumpchars{IO}: CharsFromPerson
*CharsFromPerson*:
  #getStringChars: queryNamePattern
  #getNumChars: queryIdPattern
*queryNamePattern*:
  #query: namePattern
*queryIdPattern*:
  #query: idPattern
*namePattern*:
  nameEdge: unit
*idPattern*:
  idEdge: unit
  
*Person*:
  unitWithAddress: name
  unitWithAddress: id
*unitWithAddress*:
  left: address
  right: void

  

In this case, "show" represents a function which can transform the *Bob* node into native string output.  

all entries represent point-free functions which 

This would be rewritten to the following call tree:

- Main <- showPerson{IO} <- Bob  -- showPerson
  - Main <- #dumpchars{IO} <- CharsFromPerson <- Bob
  - Main <- #dumpchars{IO} <- #getStringChars (getNumChars will never fulfill pattern with this input) <- queryNamePattern <- Bob
  - Main <- #dumpchars{IO} <- #getStringChars <- #query <- namePattern <- Bob
  - Main <- #dumpchars{IO} <- #getStringChars <- #query{namePattern} <- Bob
  - Main <- #dumpchars{IO} <- #getStringChars <- StringNode("Bob")
  - Main <- #dumpchars{IO} <- ["B", "o", "b"]
  - Main <- unit {IO.dumpchars(["B", "o", "b"])}
  - Main 
- showPerson{IO}: Alice

Tasks would be considered complete when they match a certain pattern as do their children.  They would then reduce to "completed tasks" which would simply be data constructors


