Table of Contents:
---
- [Table of Contents:](#table-of-contents)
- [Introduction:](#introduction)
- [Design:](#design)
- [Motivation:](#motivation)


## Introduction: 

Fosforescent is essentially a personal workflow engine that might also be construed as a dataflow language.

The idea that serves as the foundation is that personal tasks can be effectively modeled as extremely asynchronous function applications, and that doing so could allow us to bring the power of decades of research on effective performance for computer programs to people and organizations' processes.

To that end a workflow

The main functions it attempts to provide out of the box are:

(1) creating reusable workflows visually
(2) enabling users to edit and execute those workflows on the phone and other highly accessible contexts
(3) allowing users to collaboratively author and execute these workflows
(4) running custom analysis before, during, and after workflow execution
(5) providing the means for non-technical users to progressively automate their workflows
(6) expose an API that allows users to provide plug-in functionality to each other in a safe manner

## Design:


Graph structure: 

Fosforescent is a VM and associated runtime environment based around a content-addressed graph stored in a DHT.  

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

the names of the nodes are there for convenience.  In the tree these would be stored and referred to based on their ID or positional elements.  Here `myNode1` represents a node, and `instruction1: input1` is an edge.  `instruction1` and `input1` must also exist in the graph for this to be a valid state.  One might be able to recognize that an initial empty node with no edges must be created.  I have previously referred to this as `void` however depending on the semantics it may or may not correspond to traditional uses of that word, so perhaps `terminus` might be more appropriate, or as I also refer to it "the empty node".  Consequently the only node that can be constructed from that is the node with both an edge type and target of `terminus`.  This node I have referred to sometimes as "unit" however, as with `void`, this is not appropriate for some semantics, so perhaps a better name is the `penult` which is apparently a noun for "penultimate", or second to last.  


Working with the graphs:

The graph "store" comes provided with a "query" function as well as a "mutate" function. The query function accepts a "pattern" node which consists of any normal node, but where one or more elements are replaced with the `terminus` and `penult` nodes (my tentatively chosen wildcard nodes which might be swapped later), which are used to match nothing or anything respectively.  See [here]() for the documentation regarding externally defined instructions for manipulating graphs.  The query returns a list of nodes that would fit into the "anything" wildcards as indexed by an ordered traversal of the pattern tree.  

There are also functions for creating, replacing, and removing nodes & edges, etc. immutably.  There is extensibility to provide arbitrary semantics.  There are plans to provide some infrastructure to connect to peers via WebRTC or HTTP and synchronize graphs as well as root nodes among members of the same "logical peer".  Combined with the arbitrary semantics, this should provide the capability of managing the distribution of nodes & state through arbitrary consensus mechanisms as well, as well as switching them on the fly.   


Semantics:

This is tricky.  I believe there are many, many ways to implement semantics which could result in interesting behavior.  I think one promising type of semantics to implement could be interaction nets.  Another would be some semantics which takes the starting point of treating each node as a category. 

This is an area where frankly I'm not well-versed enough to have particularly valuable input.  As such, I'm trying to dance around this until I get something I can release to people with a better grasp than me.  In the meantime, I'm providing some sort of hard-coded task execution semantics that can provide the basis for using this as a personal workflow engine until a better semantics is found.  

So, the goal is to provide a simple interface where your semantics can simply be another node in the graph that is arrived upon through collaboratively editing these nodes in the graph.  The problem is that inherent in providing that interface, I have to create some semblance of semantics.  

My initial take on this is that given a graph like the following, copied from above with an addition:

```
instruction1:
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

Based on these semantics, a reference to the "terminus" node as the input would prevent an instruction from executing further.  a reference to the "penult" node as the input would allow execution to continue for any input. 

This pattern matching allows a semblance of control flow. The independence of reduction of any given edge/tuple on its neighbors allows parallelism.

The content addressing prevents cycles and mutations, however they can be added back in via the query mechanism.  One way is to assign a name to a node by creating a "name" edge with a target to a certain node representing the name string.  Removing such an edge from one node and moving it to another allows the query to find a different node.  In other words to follow a mutation.  Since the query instruction's cannot target the same root node that it is a part of, it can't have exactly up to date information, but it can query the most recent root if a pointer points to the previous root node.  This pointer is also the basis of a block.  So this inherently forms a blockchain.  There are many strategies to prevent conflicting instances of this kind of mutation, however one way I'd like to note is to take both conflicting mutations as "options," whereby the nodes representing the continuations of each proposed mutation are added with a "void" input so execution stops.  A peer then proposes a new block with one mutation provided a "unit" input in order to indicate their choice.  This proposed new block is broadcast to the other nodes and they provide their approval or not based on whatever consensus mechanism the group uses for resolving these sorts of "options."  In some ways this similar to merge conflict resolution. 

Messaging:

This discussion leaves out a few important details, one of them being: how do these edges get attached to a logical peer's root to begin with?  This is done through proposals by members of the logical peer. These members can either be physical peers, or they can be other logical peers, which would be equivalent to smart contracts in ethereum.  When a member proposes a new edge, the proposal is broadcast to the other members.  If they have any conflicts, those are added as "options".  This should clear the conflict and allow a consensus to be reached, however the users will then have to arrive at consensus on which option to choose in order for execution to continue. 

Messaging is done via broadcast to all members of a logical peer. So for DM's a logical peer must be set up and joined by those 2 members.  Messaging is handled by the root node of these logical peers.  When a node matching a certain pattern is submitted to the logical peer's address, the target nodes of each edge in the root node are tested as patterns against the message.  The way this is represented in the graph is through creating a new root with a new edge inserted: 

NewRoot:
 ...
 oldRoot: newEdge
 ...

In order for this message to come from outside the peer group, it must be forwarded through one of the peers in the group and proposed as a change.  This may simply be a logical peer which handles messaging, which would be referenced through some ID.  The logical 




















Query accepts a "pattern" node, which is just a node where 2 nodes are imbued with special meaning.  It essentially does a pattern match on the current node and returns a new node with the results

Mut




See [here](#motivation) for the motivation for this design

## Motivation:

If you are not convinced that personal tasks can be modeled as function applications, please [see this blog post](http://fillinlater)

Otherwise, given that assumption, we can also posit that functionality which is considered essential for programmers to work together would very likely also improve collaboration among people who are authoring workflows. Some of these aspects which over time have become considered essential are version control, a type system, syntax highlighting.  Further, by  mapping the analogy, we can determine some properties that will be necessary to the platform.

(1) These workflows are meant to be used by lots of people who are participating in workflows together, which means not only are they asynchronous, but they are highly concurrent.  As such they will need to work on structures that allow for that concurrency.  Not only are they working with shared data, but the workflows themselves are subject to concurrent modification, even during execution.  This points to the need for an immutable data structure to store the contents of the workflows and the data they are working with. This serves an alternative purpose of allowing shared dependencies among users without causing any breaking changes. The most obvious form of immutable data structure is some content-addressing scheme.  Using a hash-based content-addressing scheme provides other proven benefits.  One of which is to allow version control and conflict resolution, as well as to allow distribution through existing DHT channels such as IFPS.  Other alternatives would potentially be CRDT's, ??? .

(2) One concept behind how to visually represent these workflows is by their tree representation.  Dependencies are represented as child nodes in a tree.  While the "true" structure behind this programming language is a graph, starting at a given node, one can project that graph into an acyclical tree of finite depth by simply repeating cycles a finite amount of times, and duplicating nodes which are referenced through multiple paths.  This is how directories with shortcuts are shown in operating system directory structure viewers.  Some added visual indication of the connection between two nodes can be added as well, and further control can be maintained by only allowing one tree to be expanded at a time for linked nodes.  This sort of tree representation is well established and intuitive for users.

(3) 



