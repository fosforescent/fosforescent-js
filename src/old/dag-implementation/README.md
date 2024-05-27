- [Current state](#current-state)
- [TODO:](#todo)
- [Components](#components)
- [Working with the graphs:](#working-with-the-graphs)


## Current state

There are a few details of the interface which might change, but ultimately this part of the library is simply about serializing the graph.  There is 1 big open question which might affect the interface between this and the rest of the codebase which is whether graph rewrites can happen directly on the nodes within the store, or whether they must be fully converted into tree form before applying rewrites. 

Currently native semantics are arbitrarily mapped to certain nodes.  For instance the empty node is treated as a wildcard for a pattern which matches nothing (e.g. (succ (nothing) => nat equal to 1)).  The node which consists of a single [nothing, nothing] expression is treated as a wildcard for pattern matching which matches anything (e.g. (succ (anything) => some nat greater than or equal to 1)).  This will be updated as semantics are finalized.


The nodes of the graph are defined as either (1) primitive nodes or (2) lists of expressions (which are 2-tuples of terms).  Upon evaluating a node, each 2-tuple is evaluated and the result is a re-written list of tuples in which the left-hand sides of the expressions have been replaced with data constructors.  If this evaluation was part of another expression, this list of terms is paired with the term on the other side of the expression and the results become a new list of terms.


## TODO: 
---
(1) Rewrite pattern matching to use ts-pattern instead of writing from scratch
(2) Change querying to be relative to given root node
(3) Consider use of patricia trie library for store instead of implementing verification etc. from scratch?


## Components

node.ts / primitive-node.ts:
This contains the FosNode class as well as the "nocontextnode" class which forms the basis for it and the primitivenode classes.  Essentially the current distinction is that the NoContextNode class is for leaf nodes, whereas the FosNodes have edges to other nodes. 

- store.ts
This class is responsible for storing nodes & their content addresses, as well as providing the query interface.  It has essentially separate stores for FosNodes and NoContextNodes.  Once the semantics are finalized and it's possible to represent basic types wholly within the graph, this distinction should go away and allow a simplification of the store.  The querying is based on pattern matching.     

- node-factory.ts
This is to get the initial nodes without having to store aliases for them. 

- node-data.ts
This is currently not being used and the properties that were stored with it will be converted to use data constructors

## Working with the graphs:

The graph "store" comes provided with a "query" function. The query function accepts a "pattern" node which consists of any normal node, but where one or more elements are replaced with the `void` and `unit` nodes (my tentatively chosen wildcard nodes which might be swapped later), which are used to match nothing or anything respectively.  The query returns a list of nodes that would fit into the "anything" wildcards as indexed by an ordered traversal of the pattern tree.  

There are also functions for creating, replacing, and removing nodes & edges, etc. immutably.  There is extensibility to provide arbitrary semantics.  There are plans to provide some infrastructure to connect to peers via WebRTC or HTTP and synchronize graphs as well as root nodes among members of the same "logical peer".  Combined with the arbitrary semantics, this should provide the capability of managing the distribution of nodes & state through arbitrary consensus mechanisms as well, as well as switching them on the fly.  