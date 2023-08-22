

Switching out semantics via the root node.
---

The root node is a list of instruction - target pairs.  The instruction will either be:
(a) a type constructor or (b) a node which has patterns to match against input which feed into a type constructor
The target node will either be (a) a value (consisting of type constructors) or (b) a node which has patterns to match against input which feed into a value

A message which is passed to main is tested against the root node's patterns, and if it matches, the corresponding expression is called with the message as input.

the resulting new hash is provided to the message sender, and a new root node proposal is created.  If the proposal is accepted, all peers will now have the new root node.
one or more peers will then submit their proposed simplification of the expression, and the peers will arrive at which one to accept, if any via the consensus
mechanism

Switching out consensus mechanisms via the root node.
---

The consensus mechanism is a function which takes a list of root nodes from its peers, and returns a single root node.

The current consensus mechanism is a full-trust unanimous approval mechanism.  This is achieved by having a root function on each peer that takes a "root proposal message":
When a peer arrives at a new proposed root / "block", it will broadcast this new hash to other nodes who will 
(1) check if they're ahead of this proposal by following their block chain
  (1) if they're ahead, respond with their newer root
  (2) if they're behind and they have no pending proposals, they will update & respond with a confirmation
  (3) if they're divergent, they will update, then apply any pending proposals to the new root (as merge if necessary), and broadcast the new root as a new proposal

Any options will be resolved as a new proposal where a choice edge is added

This message can be extracted via pattern matching against the received node, with a pattern with the following characteristics:
(1) the message has the current root hash somewhere in a "previous root" field chain (behind)
(2) there is an known previous root hash in a "previous root" field chain (ahead)
(3) there is an unknown node in the "previous root" field chain (divergent)



