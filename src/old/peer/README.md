

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


Messaging:

This discussion leaves out a few important details, one of them being: how do these edges get attached to a logical peer's root to begin with?  This is done through proposals by members of the logical peer. These members can either be physical peers, or they can be other logical peers, which would be equivalent to smart contracts in ethereum.  When a member proposes a new edge, the proposal is broadcast to the other members.  If they have any conflicts, those are added as "options".  This should clear the conflict and allow a consensus to be reached, however the users will then have to arrive at consensus on which option to choose in order for execution to continue. 

Messaging is done via broadcast to all members of a logical peer. So for DM's a logical peer must be set up and joined by those 2 members.  Messaging is handled by the root node of these logical peers.  When a node matching a certain pattern is submitted to the logical peer's address, the target nodes of each edge in the root node are tested as patterns against the message.  The way this is represented in the graph is through creating a new root with a new edge inserted: 

NewRoot:
 ...
 oldRoot: newEdge
 ...

In order for this message to come from outside the peer group, it must be forwarded through one of the peers in the group and proposed as a change.  This may simply be a logical peer which handles messaging, which would be referenced through some ID.  The logical 

