- [Introduction:](#introduction)
- [Design:](#design)
- [Structural Editor:](#structural-editor)
- [Current state:](#current-state)


## Introduction: 

Fosforescent is a work in progress for a checklist-based personal workflow engine that might also be construed as a no-code dataflow programming language.  See [here](./goals_motivation.md) for a description of the technical goals and motivations for some of the design decisions.

The idea that serves as the foundation is that personal tasks can be effectively modeled as asynchronous function applications.  Starting with checklists where each task corresponds to a coroutine, we can create a graph of dependencies that gets reduced as tasks are executed.  We can create a structural editor which allows elements to be added and removed from the graph as necessary--before, during, or after execution. 

## Design:
---
Fosforescent's evaluation is based on [graph rewriting](https://en.wikipedia.org/wiki/Graph_rewriting).  The user creates something like an AST via a structural editor.  This is lazily rewritten in place into a call tree.  The call tree is then progressively simplified--at each step being rewritten into a combination of data constructor nodes and metadata, as well as executing effects.  This is reminiscent of combinator systems like [SKI calculus](https://en.wikipedia.org/wiki/SKI_combinator_calculus) or [Interaction Nets](https://en.wikipedia.org/wiki/Interaction_nets).  However, the exact semantics of these rewrites & reductions are still being worked out.  

See [here](/src) for more details



## Structural Editor: 
---
The structural editor is hosted in the [fosforescent-react](https://github.com/fosforescent/fosforescent-react) library


## Current state: 
---
While the semantics are currently being worked out, the combination of graph + structural editor should still be useable as a to-do app that can use a GPT to generate new checklists in the meantime.  This aspect is not complete, but the path to completing this work is much shorter than creating a full-fledged visual language with the care that is necessary to make it worthwhile. 




