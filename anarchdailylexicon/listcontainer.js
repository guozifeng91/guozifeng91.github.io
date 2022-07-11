class overflowlist{
  constructor(host_elem, bar_size_percentage=5){
    this.bar_size_percentage=bar_size_percentage;
    this.host_elem=host_elem;
    this.item_container=document.createElement("div");
    this.item_container.className="column_container free_element fill_parent";
    this.host_elem.appendChild(this.item_container);

    this.slots_head=document.createElement("div");
    this.slots_head.className="layout_element slot";
    this.slots_head.id="slots_head"
    this.item_container.appendChild(this.slots_head);

    this.slots_body=document.createElement("div");
    this.slots_body.className="layout_element last_child";
    this.slots_body.id="slots_body"
    this.slots_body.style="overflow:hidden;";
    this.item_container.appendChild(this.slots_body);

    this.pos_bar=document.createElement("div");
    this.pos_bar.className="placed_button free_element";
    this.pos_bar.style=`width:3%;left:95%;height:${bar_size_percentage}%;top:0%;background-color:#303030;border:0px`;

    this.slots_body.appendChild(this.pos_bar);

    this.slots=document.createElement("div");
    this.slots.className="column_container free_element";
    this.slots.id="slots_moving_div"
    this.slots.style=`top:0%;width:95%;height:auto;`;
    this.slots_body.appendChild(this.slots);

    this.list_items={};
    this.sync_items([],[]);
  }

  // update slot position by bar position
  update_bar_pos_by_slot(){
    let slot=this.slots;
    let bar=this.pos_bar;
    const pos = slot.offsetTop / (slot.offsetHeight - slot.parentElement.offsetHeight);
    bar.style.top=(bar.parentElement.offsetHeight - bar.offsetHeight) * Math.abs(pos) + "px";
  }

  // update slot position by bar position
  update_slot_pos_by_bar(){
    let slot=this.slots;
    let bar=this.pos_bar;
    const pos=bar.offsetTop / (bar.parentElement.offsetHeight - bar.offsetHeight);
    slot.style.top = (slot.offsetHeight - slot.parentElement.offsetHeight) * (-pos) + "px";
  }

  sync_items(names, urls){
    // for (let n of Object.keys(this.list_items)){
    //   if (!(n in names)){ // bug detected, in cannot be used for list elements
    //     this.remove_item(n);
    //   }
    // }

    // use remove_all_items instead as the input names and urls are sorted
    // not a good one, but a lazy solution
    this.remove_all_items();

    for(let i=0;i<names.length;i++){
      this.add_item(names[i],urls[i]);
    }
    const item_num = Object.keys(this.list_items).length
    this.slots_head.innerText=`${item_num} item(s)`;

    if (item_num==0){
      this.slots.style.top = "0%";
      this.update_bar_pos_by_slot();
    } else {
      this.update_slot_pos_by_bar();
    }
  }

  add_item(name,url){
    let list_items=this.list_items;

    if (!(name in list_items)){
      list_items[name]=document.createElement("a");
      list_items[name].className="slot layout_element";
      list_items[name].id="slot-"+name;
      list_items[name].text=decodeURI(name).replaceAll("-"," ");
      this.slots.appendChild(list_items[name]);
    }
    list_items[name].target="_blank";
    list_items[name].href=url;
  }

  remove_item(name){
    let list_items=this.list_items;
    if (name in list_items){
      this.slots.removeChild(list_items[name]);
      list_items[name].remove();
      delete list_items[name];
    }
  }

  remove_all_items(){
    let list_items=this.list_items;
    for (let name of Object.keys(list_items)){
      this.slots.removeChild(list_items[name]);
      list_items[name].remove();
      delete list_items[name];
    }
  }
}
