# Why DDD

- The single model reduces the chances of error, since the design is now a direct outgrowth of the carefully
considered model

![Comparison between Traditional and Domain Driven Model](traditional-model-vs-domain-driven.svg)

- There should be a common language between the `developers` and the `domain experts`, Translation is always inaccurate and hides the disconnect between devs and experts. In case very few billingual people manages to talk to both `devs` and `domain experts`, however, they become the `bottleneck of information` and their translations are inexact.

- Translation muddles `model concepts`

### How should be this `Ubiquitous` Language?

- `Model` as backbone
- use same language in speaking, writing, and diagrams
- persistent use of language force its weaknesses into the open.
- Domain experts object to terms or structures that are awkward or inadequate to convey domain understanding.
- While developers watch for ambiguity or inconsistency that will trip up design.
- Resolve confusion in conversation, like as in converge on agreed meaning of ordinary words.
- Domains Experts **Needs** to understand the model, if they don't there is something wrong with the model.

### How should be modelling done effectively?

- UML can be a good starting point
- It should not be used to model the whole system
- It handles one half effectively (attributes and relationsips)
- but behaviour of objects and constraints on them cannot be easily illustrated
- the idea is to highlight some tricky hotspots in design
- for constraints and assertion, uml fall back on text, place in little brackets, inserted in diagram
- Behavioral responsibilities of an object can be hinted at through operations names, and implicitly
demonstrated with object interaction (or sequence) diagrams, but they cannot be stated. so use suplemental text or conversation.
- `explanatory model` and the `model that drives design` are different

### Why Analysis Model Fails?

- The developers are forced to reconceptualize the domain on their own, and there is no guarantee that the insights gained by the analysts and embedded in the model will be retained or rediscovered.
- Pure analysis model even falls short of its primary goal of understanding the domain, because crucial discoveries always emerge during the design/implementation effort as very specific problems are encountered that were not anticipated.

Domain Model should satisfy both objectives, analysis and design. 


## References

- sometimes different models will exist to support different subsystems (see **Chapter 14,Maintaining Model Integrity**), sharing one set of concepts from analysis through all aspects of implementation within a given development effort.


_left at page 45_