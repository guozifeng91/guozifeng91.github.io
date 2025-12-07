/* generate article page contents from markdown */

export function fetch_and_do(url, action)
{
    console.debug(url);
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        response.text().then(
            text => {
                // console.log(text);
                action(text);
            }
        );
    })
};

/* md parser */
const escape_char = (md) => md.replace(/</g, "&lt;").replace(/>/g, "&gt;");
const parse_h1 = (md) => md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
const parse_h2 = (md) => md.replace(/^## (.*$)/gim, '<h2>$1</h2>');
const parse_h3 = (md) => md.replace(/^### (.*$)/gim, '<h3>$1</h3>');
const parse_bold = (md) => md.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
const parse_italic = (md) => md.replace(/\*(.*?)\*/gim, '<i>$1</i>');
const parse_link = (md) => md.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
const parse_br = (md) => md.replace(/\n/gim, '<br>');
const parse_codeblock = (md) => md.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
const parse_img = (md) => md.replace(/\!\[(.*?)\]\((.*?)\)/gim, '<img class="$1" src="$2"/>');
const parse_bullet = (md) => md.replace(/^\s*[\-\*] (.*)$/gim, '<ul><li>$1</li></ul>').replace(/<\/ul>\s*<ul>/gim, '');
const parse_number = (md) => md.replace(/^\s*\d+\. (.*)$/gim, '<ol><li>$1</li></ol>').replace(/<\/ol>\s*<ol>/gim, '');
const parse_p = (md, trim_empty) => {
  md = md
    .trim()
    // split by \n
    .split(/\n/)
    .map(block => {
        /* untrim to keep additional empty lines functional */
        var trim = trim_empty ? block.trim() : block;
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
export function parse_to_html(md, options)
{
    md = escape_char(md);
    md = parse_h1(md);
    md = parse_h2(md);
    md = parse_h3(md);
    // img first, link follows
    md = parse_img(md);
    md = parse_link(md);

    md = (options['no_list'] ?? false) ? md : parse_bullet(md);
    md = (options['no_list'] ?? false) ? md : parse_number(md);

    md = parse_bold(md);
    md = parse_italic(md);

    md = parse_codeblock(md);

    md = parse_p(md, options["trim_empty"] ?? false);
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

export function parse_to_DOM(md, trim_empty)
{
    var html_str = parse_to_html(md, trim_empty);
    var doc = new DOMParser().parseFromString(html_str, "text/html");
    return doc;
}

export function try_set_title(src_doc){
    var elems = Array.from(src_doc.body.childNodes);
    
    for(const elem of elems){
        var tag = elem.tagName;

        if (tag == "H1"){
            document.title = elem.textContent;
            console.log("title", elem.textContent);
            break;
        }
    }
}

function is_null_or_empty(str)
{
    return str == null || str == "";
}

function add_cls_to_elem(elem, cls)
{
    if (is_null_or_empty(cls))
        return;

    elem.className = elem.className + " " + cls;
}

/* create a div and consume the stacked imgs */
function create_div_and_consume_img_stack(
    root, 
    img_stack, 
    cls_centered,
    cls_normal,
    cls_img_group)
{
    var stack_size = img_stack.length;
    var parent_div = document.createElement("div");
    root.appendChild(parent_div);

    add_cls_to_elem(
        parent_div, 
        stack_size > 0 ? cls_centered : cls_normal
    );

    if (stack_size == 1){
        parent_div.appendChild(img_stack[0]);
    }else if (stack_size > 1){
        var child_div = document.createElement("div");
        add_cls_to_elem(child_div, cls_img_group);
        for(const img_elem of img_stack){
            var container = document.createElement("div");
            container.appendChild(img_elem);
            img_elem.style="max-width:100%;";
            child_div.appendChild(container);
        }
        parent_div.appendChild(child_div);
    }
    return parent_div;
}

/*
add DOM elements to the current document

rules
1. special elements such as H1, H2 (found in cls_special_tags dictionary),
   will be wrapped by its own <div>. div will not get class assigned,
   each element gets its own class

2. continuous non-special elements, such as <p>s will be wrapped in 
   the same <div>, the <div> is assigned class p_class, <p> has no class

3. 2 stops, if a special element, or <img> is encountered.

4. single <img> will be wrapped in a <div> together with the <p> immediately
   behinds it. this <div> gets a class = p_class_center.

5. continuous <imgs>s will be wrapped in a <div>, and this <div> will be treated
   as a single image and 4. applies
 */
export function
add_DOM_to_document(
    src_doc,                // src DOM document
    root,                   // root element in target document
    cls_special_tags,       // dict of tag-name => class name
    cls_normal,             // class name for <p> (will be assigned to wrapping div)
    cls_centered,           // class name for <p> that will be centered (will be assigned to wrapping div)
    cls_img_group           // class name for <div> that contains the group of images (rule 5.)
){
    var img_stack = [];
    var current_div = null;
    var elems = Array.from(src_doc.body.childNodes);

    for(const elem of elems){
        var tag = elem.tagName;
        if (tag == null)
            continue;

        var is_special = tag in cls_special_tags;
        var is_img = tag == "IMG";

        if (is_special && !is_img)
        {
            // reset so new div will be created
            current_div = null;

            // special tags that should be placed within their own divs
            add_cls_to_elem(elem, cls_special_tags[tag]);
            var div = document.createElement("div");
            div.appendChild(elem);
            root.appendChild(div);
            continue;
        }

        if (is_img){
            // reset so new div will be created
            current_div = null;
            img_stack.push(elem);
            continue;
        }

        if (current_div == null){
            current_div = create_div_and_consume_img_stack(
                root,
                img_stack,
                cls_centered,
                cls_normal,
                cls_img_group);
        }

        current_div.appendChild(elem);

        if (img_stack.length > 0){
            current_div = null;
            img_stack = [];
        }
    }
    
    if (img_stack.length > 0){
        create_div_and_consume_img_stack(
                root,
                img_stack,
                cls_centered,
                cls_normal,
                cls_img_group);
    }
}

export function add_md_to_document(
    md,
    root,
    options,
    cls_special_tags,
    cls_normal,
    cls_centered,
    cls_img_group
){
    var doc = parse_to_DOM(
        md,
        options
    );
    
    // use the first H1 as title
    try_set_title(doc);

    // add the doc to the document object
    add_DOM_to_document(
        doc, 
        root, 
        cls_special_tags, 
        cls_normal, 
        cls_centered, 
        cls_img_group);
};

// console.log(parse_to_DOM(md_sample));

export function add_md_to_document_default_style(
    md
){
    var root = document.getElementById("article-container");
    const default_specials_tags = {
        "H1": "title1",
        "H2": "title2",
        "H3": "title3",
        // 'IMG': "",
        'OL': "main-text",
        'UL': "main-text"
      };

    const default_options = {
        "no_list" : false,
        "trim_empty": false
    }

    add_md_to_document(
        md,
        root,
        default_options,
        default_specials_tags,
        "main-text",
        "main-text-centered",
        "row-column-container"
    );
}

/* 
a compact entry for most pages

- parse .md from the ?article=XXX query
- use pre-set css class

*/
export function fetch_article_and_add_to_document_default()
{
    const url_str = window.location.search;
    const url_params = new URLSearchParams(url_str);
    var md_url = url_params.get('url');
    console.debug(md_url);

    if (md_url != null) {
        fetch_and_do(md_url, add_md_to_document_default_style);
    }
}