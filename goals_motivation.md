## Initial Goals

The main functions Fosforescent will attempt to provide out of the box are:

(1) creating reusable workflows visually
(2) enabling users to edit and execute those workflows on the phone and other highly accessible contexts
(3) allowing users to collaboratively author and execute these workflows
(4) running custom analysis before, during, and after workflow execution
(5) providing the means for non-technical users to progressively automate their workflows
(6) expose an API that allows users to provide plug-in functionality to each other in a safe manner

Some future beneficial side-effects that this would likely enable would be:

(1) Allowing users to create, execute & set triggers for workflows with arbitrary side effects (no-code backends)
(3) Allowing organizations to version and progressively automate their processes and policies
(2) Allowing users to collaboratively orchestrate complicated projects in a decentralized way

## Motivation:

If you are not convinced that personal tasks can be modeled as function applications, please [see this blog post](http://fillinlater)

Otherwise, given that assumption, we can also posit that functionality which is considered essential for programmers to work together would very likely also improve collaboration among people who are authoring workflows. Some of these aspects which over time have become considered essential are version control, a type system, syntax highlighting.  Further, by  mapping the analogy, we can determine some properties that will be necessary to the platform.

These workflows are meant to be used by lots of people who are participating in workflows together, which means not only are they asynchronous, but they are highly concurrent.  As such they will need to work on structures that allow for that concurrency.  Not only are they working with shared data, but the workflows themselves are subject to concurrent modification, even during execution.  This points to the need for an immutable data structure to store the contents of the workflows and the data they are working with. This serves an alternative purpose of allowing shared dependencies among users without causing any breaking changes. The most obvious form of immutable data structure is some content-addressing scheme.  Using a hash-based content-addressing scheme provides other proven benefits.  One of which is to allow version control and conflict resolution, as well as to readily allow distribution through a DHT.  Other alternatives would potentially be CRDT's which might merit future consideration.

One concept behind how to visually represent these workflows is by their tree representation.  Dependencies are represented as child nodes in a tree.  While the "true" structure behind this programming language is a graph, starting at a given node, one can project that graph into an acyclical tree of finite depth by simply repeating cycles a finite amount of times, and duplicating nodes which are referenced through multiple paths.  This is how directories with shortcuts are shown in operating system directory structure viewers.  Some added visual indication of the connection between two nodes can be added as well, and further control can be maintained by only allowing one tree to be expanded at a time for linked nodes.  This sort of tree representation is well established and intuitive for users.





