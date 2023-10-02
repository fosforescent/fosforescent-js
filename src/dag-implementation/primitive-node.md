Extensions:
---
Extensions take 2 forms:  (monad-ish vs effect-ish)


Extensions of form 1 are added to the root node.  They consist of an edge type as well as various functions to and from that.
The functions are added as "workflows"

When a new expression is created from the root level, it must be made available through a registered extension.  

An extension also has a combination of required and optional type constructors: these are added as edges which terminate with 
pattern nodes, so ultimately it is a big pattern. 



It also has value nodes which can satisfy those patterns.  These are ultimately type constructors upon which it is dependent, so while the pattern node
is ultimately what is registered as the extension, there are other node dependencies which come with it which will not be attached to the root node independently

Therefore, the extension is registered by:
- being added as a file peer, 
    - should include relevant store nodes
    - 
- which then opens a transaction, 
- applies a diff,
  - diff includes store
  - creating a new root which includes itself
- the user reviews the diff and commits it

examples of extensions are


