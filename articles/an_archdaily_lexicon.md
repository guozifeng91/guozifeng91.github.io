# An Archdaily Lexicon

[Explore](/anarchdailylexicon_tsne.html)

*An Archdaily Lexicon* is a search engine of architectural images. It challenges the representational paradigm suggested by the *Building Information Modeling* where everything has to be represented using the same pre-defined ontology.

[A symbolic set of visual elements](/anarchdailylexicon.html)

*An Archdaily Lexicon* proposes to encode objects by their relations to the plenty - a finite symbolic set from which objects are 'spelled' as of spelling texts with an alphabet. The symbolic set is derived from the plenty and carries no semantic meaning.

*An Archdaily Lexicon* demonstrates this concept by clustering image patches of all ArchDaily images. The obtained clusters encode a given image by their Euclidean distances to the patches of the image. The query and comparision of the images are therefore based on the similarity of the encodings rather than the pixel colors.

![](/anarchdailylexicon/media/symbols.jpg)
Symbolic set of visual elements

![](/anarchdailylexicon/media/encoding2.svg)
Image encoding using the symbolic set

## Case 1. "Text to Text" search

Search for similar images of the input source (top left), by comparing the visual elements extracted from the source and those from the target candidates. 

![](/anarchdailylexicon/media/img-img-1.jpg)
Spaces of wooden frames

![](/anarchdailylexicon/media/img-img-2.jpg)
Spaces of large concrete pieces

![](/anarchdailylexicon/media/img-img-3.jpg)
Spaces of living rooms with vertical lines

## Case 2. "Words to Text" search

Search for similar images of that contains certain visual elements given as the input (top left with red boundary).

![](/anarchdailylexicon/media/patch-img-1.jpg)
Spaces of chairs in concretes

![](/anarchdailylexicon/media/patch-img-2.jpg)
Spaces of books in concretes

![](/anarchdailylexicon/media/patch-img-3.jpg)
Spaces of bicycles