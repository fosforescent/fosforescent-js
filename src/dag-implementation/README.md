
Definitions
===


pre-write-time workflow
---
This is a workflow which has not been instantiated with a "write-time pattern" yet.  It is a skeleton of dependencies.
However since it doesn't have any information (even a name), it's not suitable to present to the user.
This should be created by the user on the main screen with a "create workflow" dialogue, which 
should also have a pattern input fieldset to allow the user to specify how the task will be constructed

since the starting node will be congruent for every workflow, it can be constructed via a mutation, so it can be available as a 
"create workflow" mutation statically stored on the root node which gets passed to the dependencies so it can be called
within the child branches of a workflow as well (be made available in "available instructions")


write-time workflow
---
This is a workflow which has been instantiated with a "write-time pattern". 
The input fieldset is generated from the pattern, and the user can fill in the values.

It would be attached to the root node via a separate transaction or assignment constructor from the 
pre-write-time workflow.  Allocations would be considered write-time requirements.

during write time, all edits are stored as part of a "transaction" which is later submitted to other peers in the peer group


running workflows / creating "todos"
---
Once a workflow has fulfilled its write-time pattern, and propagated throughout the peer group via peer approvals, it can be run to create a "todo".
This is a workflow which has been instantiated with a "run-time pattern". as well as a "result constructor"

The "run-time pattern" can be a subset of the write-time pattern, or a superset of the write-time pattern.
If it is a superset, then (1) either the "effect" fields of the write-time pattern will be used to fill in the
missing fields, or (2) an IO task will be created to fill in the missing fields.

The result constructor can be a simple type constructor, or an instruction which returns the 
appropriate type constructor.  

returning & assigning values from "todos"
---
 A todo can either come from another client, so be called with an instruction representing the 
effect to callback from the client, or it can come from the same client, in which case
it should be called with an "assignment" instruction.  

The assignment instruction would be a type constructor which allows for later accessing the value
via pattern matching against the root node.

 

Type Constructors
---
A type constructor is an edge type which can be used to create a pattern representing the next available/required edge types, if any. 

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

Patterns
---
A pattern is a node which can be used to 

(1) ensure that a target node it is applied to has an appropriate structure 
(2) once validated, extract information from the target node.
(3) A pattern node which is applied to a target that does not complete the pattern instead produces a new pattern representing the missing/invalid info

If an appropriate type constructor precedes a pattern falling into case (3), then the type constructor / pattern combo represents a "closure"





