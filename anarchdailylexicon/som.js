// declare the global variable selected_cells
var cell_projects=[];
var selected_cells=[];
var selected_cell_groups={};

// const group_color=["#ffffff","#ff8080","#000000"];
const group_color=["#FEFEFA", "#848482", "#A52A2A", "#568203","#007FFF", "#1B1811"];
const group_num_max=group_color.length;

const create_list_container = function(div_list_cell_contents){
  const list_div_obj=new overflowlist(div_list_cell_contents);
  // mouse wheel event on slots, update pos bar while wheeling
  wheelElement(list_div_obj.slots, function(){list_div_obj.update_bar_pos_by_slot()});
  dragElementY(list_div_obj.pos_bar, `${100-list_div_obj.bar_size_percentage}%`, function(){list_div_obj.update_slot_pos_by_bar()})
  return list_div_obj;
};

const create_som_GUI_operations = function(cells, list_div_obj, div_selected_group_info){
  // - cells: som cells
  // - div_list_cell_contents: parent div which hosts the content list
  // - div_selected_group_info: parent div which shows the info of selected groups
  // display list area
  const default_inner_text=div_selected_group_info.innerHTML;
  // function 1
  // generate display items (the list)
  const show_contents_selected_cells=function () {
    // this function needs list_div_obj
    // it feeds list_div_obj the names and urls from selected cells
    let onehot_activated_group=0;

    let counts={}; // in which group a project shows up
    let names=[];
    let urls=[];

    let orders_dict={}; // the total order of a project shows up in all groups
    let orders=[];

    // count how many times each project shows up
    for (let c of selected_cells){
      const current_group=selected_cell_groups[c];
      onehot_activated_group = onehot_activated_group | (1<<current_group);

      let order_in_cell=0;
      for (let i of cell_projects[c]){
        if (i in counts){
          counts[i]= counts[i] | (1<<current_group);
        } else {
          counts[i]=(1<<current_group);
        }

        // record order
        if (i in orders_dict){
          orders_dict[i]+=order_in_cell; // sum or min?
        } else {
          orders_dict[i]=order_in_cell;
        }
        order_in_cell++;
      }
    }

    // display those that shows up top
    for (let i of Object.keys(counts)){
      if (counts[i]==onehot_activated_group){
        names.push(namelist[i]);
        urls.push(urllist[i]);
        orders.push(orders_dict[i]); // record order
      }
    }

    // argsort code taken from
    // https://stackoverflow.com/questions/46622486/what-is-the-javascript-equivalent-of-numpy-argsort
    // changed from arg2-arg1 to arg1-arg2, to inverse the sorting order
    const dsu = (arr1, arr2) => arr1
      .map((item, index) => [arr2[index], item]) // add the args to sort by
      .sort(([arg1], [arg2]) => arg1 - arg2) // sort by the args
      .map(([, item]) => item); // extract the sorted items

    // sort the name and urlname
    names=dsu(names, orders);
    urls=dsu(urls, orders);

    list_div_obj.sync_items(names,urls);
  };

  const apply_selection_style = function (){
    // this function needs cells
    // it changes the style of selected cells
    if (selected_cells.length==0){
      for (let c of cells){
        // c.style.opacity="1.0";
        c.className="cell";
        c.style.border="0px";
      }
    } else {
      // first reset all cells
      for (let c of cells){
        // c.style.opacity="0.3";
        c.className="cell has_opacity";
        c.style.border="0px";
      }
      // then set selected cells
      for (let i of selected_cells){
        // cells[i].style.opacity="1.0";
        cells[i].className="cell";
        // cells[i].style.border="2px solid #ffffff";
        cells[i].style.border=`4px solid ${group_color[selected_cell_groups[i]]}`;
      }
    }
  };

  // display group info (i.e., color AND color AND color)
  // const selected_group_info=document.getElementById("selected_group_info");
  // const default_inner_text=selected_group_info.innerHTML;
  const update_selected_group_info = function(){
    // this function needs:
    // - clear_all_selection: to support the button
    // - div_selected_group_info: to show the info
    selected_group_info = div_selected_group_info;
    if (selected_cells.length==0){
      selected_group_info.innerHTML=default_inner_text;
    } else {
      selected_group_info.innerHTML="";
      let indicator=0;
      let added_colors=0;

      // add info blocks
      for (let c of selected_cells){
        const current_group=selected_cell_groups[c];
        if ((indicator & (1<<current_group))==0){
          indicator = indicator | (1<<current_group);
          if (added_colors>0){
            let span_and=document.createElement("div");
            span_and.className="layout_element";
            span_and.innerText="AND";
            span_and.style="margin-left: 10px;margin-right: 10px;"
            selected_group_info.appendChild(span_and);
          }
          let span=document.createElement("div");
          span.className="color_block layout_element";
          span.style="background-color:"+group_color[current_group] + ";border:1px solid #000000";
          selected_group_info.appendChild(span);
          added_colors++;
        }
      }

      // add clear all button
      let clear_button=document.createElement("div");
      clear_button.className="placed_button layout_element";
      clear_button.style="color:gray;border:0px;width:100%;margin-top: 2px;margin-bottom: 2px;";
      clear_button.innerText="Clear All";
      clear_button.onclick=clear_all_selection;
      clear_button.onmouseover=function(e){clear_button.style.color="black"};
      clear_button.onmouseout=function(e){clear_button.style.color="gray"};
      selected_group_info.appendChild(clear_button);
    }
  };

  const clear_all_selection = function(){
    selected_cells=[];
    selected_cell_groups={};
    // const cells are returned by the SOM part
    apply_selection_style();
    show_contents_selected_cells();
    update_selected_group_info();
  };

  const on_change_selection = function(){
    apply_selection_style();
    show_contents_selected_cells();
    update_selected_group_info();
  };

  const on_change_group = function(){
    show_contents_selected_cells();
    update_selected_group_info();
  };

  return [on_change_selection, on_change_group];
};

// create SOM function
const create_som = function (parent, cell_num, img_size){
  // inputs:
  // - parent: html element
  // - cell num (e.g., 15, which means 15 x 15 grid)
  // - image size (e.g., 100)
  // returns: cells (which are html objects)

  const som = (function (parent, cell_num){
    // const parent=document.getElementById("display_section");
    let som=document.createElement("div");
    som.id="som";
    // som.className="parent";
    som.style=`grid-template-columns:repeat(${cell_num},1fr);`
    parent.appendChild(som);
    return som;
  })(parent, cell_num);

  // populate som grid
  const cells = (function (cell_num,img_size){
    // let som=document.getElementById("som");
    let cells=[];

    for(let row=0;row<cell_num;row++){
      for(let col=0;col<cell_num;col++){
        let index=row*cell_num+col;
        let cell=document.createElement("div");
        cell.className="cell";
        cell.id=`cell${index}`;
        som.appendChild(cell);

        let cell_img=document.createElement("img");
        cell_img.className="cell_img";
        cell_img.src=`anarchdailylexicon/data/som/${cell_num}x${cell_num}/cells/${row}-${col}-${img_size}.jpg`;

        cell.appendChild(cell_img);
        cells.push(cell);

        // cell mouseover behaviour
        cell.onmouseover = cell.onmouseout = function (event) {
          let type = event.type;
          if (type=="mouseover"){
            cell_img.style.transform="scale(1.5)";
            cell.style.opacity="1.0"; // override opacity setting
          }else{
            cell_img.style.transform="scale(1.01)";
            cell.style.removeProperty("opacity"); // remove element-level setting
          }
        }
      }
    }
    return cells;
  })(cell_num,img_size);

  return cells;
}

const add_cell_behaviour = function (cells, on_change_selection, on_change_group){
  // cell behaviour functions
  class cell_behaviour{
    constructor(cell,cell_index){
      this.cell=cell;
      this.index=cell_index;
      this.last_touch_pos=0;
      this.in_selection=false;
    };

    change_cell_group(sign){
      const index=this.index;
      const cell=this.cell;

      selected_cell_groups[index] = (selected_cell_groups[index] + group_num_max + sign)%group_num_max;

      cell.style.border=`4px solid ${group_color[selected_cell_groups[index]]}`;
      // get_display_content_of_selected_cells();
      // update_selected_group_info();
      on_change_group();
    };

    cell_onclick(e){ // onclick behaviour
      const index=this.index;
      const in_list = selected_cells.indexOf(index);

      if (in_list>-1){
        // remove
        selected_cells.splice(in_list, 1);
        delete selected_cell_groups[index]; // bug fix (confusion between in_list (which was i) and index)
        this.in_selection=false;
      } else {
        // add
        selected_cells.push(index);
        selected_cell_groups[index]=0;
        this.in_selection=true;
      }
      // apply_selection_style();
      // get_display_content_of_selected_cells();
      // update_selected_group_info();
      on_change_selection();
    };

    cell_onwheel(e){ // onwheel behaviour
      // console.log(this.index,this.in_selection);
      if (this.in_selection){ // do nothing unless in selection
        e = e || window.event;
        e.preventDefault();
        this.change_cell_group(Math.sign(e.deltaY));
      }
    }

    cell_touchmove(e){ // touchmove behaviour
      e = e || window.event;
      if (this.in_selection && e.touches.length==1){ // do nothing unless in selection
        if (e.type=="touchmove"){ // touch move
          e.preventDefault();
          let sign=e.touches[0].screenY-this.last_touch_pos;

          if (Math.abs(sign)>10){ // use threshold to reduce sensitivity
            sign=Math.sign(sign);
            this.last_touch_pos=e.touches[0].screenY;
            this.change_cell_group(sign);
          }
        } else { // touch start
          this.last_touch_pos=e.touches[0].screenY;
        }
      }
    };
  };

  for (let index=0;index<cells.length;index++){
    const bh = new cell_behaviour(cells[index], index);
    const cell = cells[index];
    cell.onclick=function(e){bh.cell_onclick(e);};
    cell.onwheel=function(e){bh.cell_onwheel(e);};
    const cell_touchmove_func=function(e){bh.cell_touchmove(e);};
    cell.addEventListener("touchstart", cell_touchmove_func, {passive:false});
    cell.addEventListener("touchmove", cell_touchmove_func, {passive:false});
    cell.addEventListener("touchend",
      function (e){
        for (let c of cells){
            c.children[0].style.transform="scale(1.01)";
            c.style.removeProperty("opacity"); // override opacity setting
        }
      }
    ,{passive:false});
  }
};
