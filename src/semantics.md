Operational semantics:
---


The content addressed graph we are given is described in dag-implementation.  It is a content addressed graph with edges and edge types corresponding to edges that already exist in the graph. 

The result is a set of sets of tuples { (A{0}, B{0}){0}, (A{1}, B{1}){1} (A{n}, B{n}){n} } such that the individual tuples' first element represents a function that can transition the second element into a type which is an allowed constructor

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

By adding a "task" edge to a node, it ensures that it will be given a "status" data constructor, and that it will not return any values until its status constructor is set to "complete"

the "task" edge can be composed with any other edge type by creating a new node, composing "task" to that edge type, and then using that edge instead. 

