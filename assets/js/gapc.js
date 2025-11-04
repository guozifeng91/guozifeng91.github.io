/* generate article page contents from markdown */

export function fetch_and_do(url, action)
{
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        // do something on the content
        action(response.text());
    })
};

/* md parser */
const escape_char = (md) => md.replace(/</g, "&lt;").replace(/>/g, "&gt;");
const parse_h1 = (md) => md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
const parse_h2 = (md) => md.replace(/^## (.*$)/gim, '<h2>$1</h2>');
const parse_h3 = (md) => md.replace(/^## (.*$)/gim, '<h3>$1</h3>');
const parse_bold = (md) => md.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
const parse_italic = (md) => md.replace(/\*(.*?)\*/gim, '<i>$1</i>');
const parse_link = (md) => md.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
const parse_br = (md) => md.replace(/\n/gim, '<br>');
const parse_codeblock = (md) => md.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
const parse_img = (md) => md.replace(/\!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />');
const parse_bullet = (md) => md.replace(/^\s*[\-\*] (.*)$/gim, '<ul><li>$1</li></ul>').replace(/<\/ul>\s*<ul>/gim, '');
const parse_number = (md) => md.replace(/^\s*\d+\. (.*)$/gim, '<ol><li>$1</li></ol>').replace(/<\/ol>\s*<ol>/gim, '');
const parse_p = (md) => {
  md = md
    .trim()
    // split by \n
    .split(/\n/)
    .map(block => {
        var trim = block.trim();
        if (trim == "")
            return "";

        // skip html item
        if (/^\s*<(h\d|ul|ol|li|pre|img|blockquote|code|p)/.test(trim))
            return block;
        
        // wrap in <p>
        return `<p>${trim}</p>`;
    })
    .join('\n');

  return md;
}

/* parser main */
export function parse_to_html(md)
{
    md = escape_char(md);
    md = parse_h1(md);
    md = parse_h2(md);
    md = parse_h3(md);
    // img first, link follows
    md = parse_img(md);
    md = parse_link(md);

    md = parse_bullet(md);
    md = parse_number(md);

    md = parse_bold(md);
    md = parse_italic(md);

    md = parse_codeblock(md);

    md = parse_p(md);
    return md;
}

export const md_sample = `
# Markdown Demo

This is a paragraph of text.
It will automatically be wrapped in <p> tags.

## Subtitle 1

This is another paragraph of text.

This is another paragraph of text.

- first
- second
- thrid

## Subtitle 2

Some texts

1. item 1
2. item 2
3. item 3

## Subtitle 3

some texts

![alt text](.link)

below image text

[content](.link)

some texts with [content](.link)

`

export function parse_to_DOM(md)
{
    var html_str = parse_to_html(md);
    // console.log(html_str)
    var doc = new DOMParser().parseFromString(html_str, "text/html");
    // console.log(doc)
    // for(const elem of doc.body.childNodes){
    //     console.log(elem);
    // }
    return doc;
}

/*
add DOM elements to the current document

rules
1. special elements (tag name found in cls_special_tags dictionary),
   will be wrapped by its own <div>. div will not get class assigned,
   each element gets its own class

2. continuous non-special elements, such as <p> will be wrapped in 
   the same <div>, the <div> is assigned class p_class, <p> has no class

3. special rule for <img>: will be wrapped in a <div> assigned class
   p_class_center. the immediate non-special element that follows the <img>,
   will be treated as img caption and put into the same <div> of the image
 */
export function
add_DOM_to_document(
    src_doc,            // src DOM document
    root,               // root element in target document
    cls_special_tags,   // dict of tag-name => class name
    p_class,            // class name for <p> (will be assigned to wrapping div)
    p_class_center      // class name for <p> that will be centered (will be assigned to wrapping div)
){
    // example of cls_special_tags
    // var specials = {
    //     "H1": h1_class,
    //     "H2": h2_class,
    //     "H3": h3_class,
    //     'IMG': img_class,
    //     'OL': p_class,
    //     'UL': p_class
    // }

    var last_div = null;
    var last_is_img = false;

    for(const elem of src_doc.body.childNodes){
        var tag = elem.tagName;
        var is_special = tag in cls_special_tags;

        var cls = is_special ? cls_special_tags[tag] : p_class;
        var is_img = elem.tagName == "IMG";

        if (is_special)
            elem.className = cls;

        // create new div tag?
        if (is_special || is_img || last_div == null){
            last_div = document.createElement("div");
            root.appendChild(last_div);
            
            // paragraph style in div
            // other styles in tag
            if (!is_special)
                last_div.className = cls;

            if (is_img)
                last_div.className = p_class_center
        }

        // add elem to last_div
        last_div.appendChild(elem);

        // reset, when current is not img, and is special elem
        // or last is img, and current is not special elem
        if (is_special && !is_img)
            last_div = null;
        
        if (!is_special && last_is_img)
            last_div = null;

        last_is_img = is_img;
    }
}

export function add_md_to_document(
    md,
    root,
    cls_special_tags,
    p_class,
    p_class_center
){
    var doc = parse_to_DOM(md);
    add_DOM_to_document(doc, root, cls_special_tags, p_class, p_class_center)
};

// console.log(parse_to_DOM(md_sample));
