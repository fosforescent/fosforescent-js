Table of Contents:
---
- [Table of Contents:](#table-of-contents)
- [Introduction:](#introduction)
- [Motivation:](#motivation)
- [Design:](#design)


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

## Motivation:

If you are not convinced that personal tasks can be modeled as function applicaitons, please [see this blog post](http://fillinlater)

Based on that assumption, we can also posit that functionality which is considered essential for programmers to work together would very likely also improve collaboration among people who are authoring workflows. Some of these aspects which over time have become considered essential are version control, a type system, syntax highlighting.  Further, by  mapping the analogy, we can determine some properties that will be necessary to the platform.

(1) These workflows are meant to be used by lots of people who are participating in workflows together, which means not only are they asynchronous, but they are highly concurrent.  As such they will need to work on structures that allow for that concurrency.  Not only are they working with shared data, but the workflows themselves are subject to concurrent modification, even during execution.  This points to the need for an immutable data structure to store the contents of the workflows and the data they are working with. This serves an alternative purpose of allowing shared dependencies among users without causing any breaking changes. The most obvious form of immutable data structure is some content-addressing scheme.  Using a hash-based content-addressing scheme provides other proven benefits.  One of which is to allow version control and conflict resolution, as well as to allow distribution through existing DHT channels such as IFPS.  Other alternatives would potentially be CRDT's, ??? .

(2) One concept behind how to visually represnt these workflows is by their tree representation.  Dependencies are represented as child nodes in a tree.  This


## Design:

That motivation leads to some of the following system contraints.  (1) must 


Because of the preceding constraints
