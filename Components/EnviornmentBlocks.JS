import React from 'react';

// Platformer Environment Blocks
export const PLATFORMER_BLOCKS = `
<category name="🏃 Platformer" colour="45">
  <block type="platform_set_gravity">
    <value name="FORCE"><shadow type="math_number"><field name="NUM">0.8</field></shadow></value>
  </block>
  <block type="platform_enable_collision">
    <value name="SPRITE_ID"><shadow type="text"><field name="TEXT">player</field></shadow></value>
  </block>
  <block type="platform_jump">
    <value name="SPRITE_ID"><shadow type="text"><field name="TEXT">player</field></shadow></value>
    <value name="FORCE"><shadow type="math_number"><field name="NUM">-15</field></shadow></value>
  </block>
  <block type="platform_is_grounded">
    <value name="SPRITE_ID"><shadow type="text"><field name="TEXT">player</field></shadow></value>
  </block>
  <block type="platform_create_terrain">
    <value name="X"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="Y"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
    <value name="WIDTH"><shadow type="math_number"><field name="NUM">800</field></shadow></value>
    <value name="HEIGHT"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
  </block>
  <block type="platform_create_platform">
    <value name="X"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
    <value name="Y"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
    <value name="WIDTH"><shadow type="math_number"><field name="NUM">150</field></shadow></value>
    <value name="HEIGHT"><shadow type="math_number"><field name="NUM">20</field></shadow></value>
  </block>
  <block type="platform_double_jump">
    <value name="SPRITE_ID"><shadow type="text"><field name="TEXT">player</field></shadow></value>
  </block>
  <block type="platform_wall_slide">
    <value name="SPRITE_ID"><shadow type="text"><field name="TEXT">player</field></shadow></value>
    <value name="SPEED"><shadow type="math_number"><field name="NUM">2</field></shadow></value>
  </block>
</category>
`;

// Top-Down Environment Blocks
export const TOPDOWN_BLOCKS = `
<category name="🗺️ Top-Down" colour="210">
  <block type="topdown_grid_move">
    <value name="SPRITE_ID"><shadow type="text"><field name="TEXT">player</field></shadow></value>
    <value name="DIRECTION"><shadow type="text"><field name="TEXT">up</field></shadow></value>
    <value name="GRID_SIZE"><shadow type="math_number"><field name="NUM">32</field></shadow></value>
  </block>
  <block type="topdown_set_grid_position">
    <value name="SPRITE_ID"><shadow type="text"><field name="TEXT">player</field></shadow></value>
    <value name="GRID_X"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="GRID_Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
  </block>
  <block type="topdown_get_grid_position">
    <value name="SPRITE_ID"><shadow type="text"><field name="TEXT">player</field></shadow></value>
  </block>
  <block type="topdown_create_tilemap">
    <value name="TILES"><shadow type="text"><field name="TEXT">[[0,1,0],[1,0,1]]</field></shadow></value>
    <value name="TILE_SIZE"><shadow type="math_number"><field name="NUM">32</field></shadow></value>
  </block>
  <block type="topdown_check_tile">
    <value name="GRID_X"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="GRID_Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
  </block>
  <block type="topdown_set_tile">
    <value name="GRID_X"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="GRID_Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="TILE_ID"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
  </block>
  <block type="topdown_arrow_keys_move">
    <value name="SPRITE_ID"><shadow type="text"><field name="TEXT">player</field></shadow></value>
    <value name="SPEED"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
  </block>
  <block type="topdown_8dir_move">
    <value name="SPRITE_ID"><shadow type="text"><field name="TEXT">player</field></shadow></value>
  </block>
</category>
`;

// 3D Environment Blocks (Three.js)
export const THREEJS_BLOCKS = `
<category name="🎲 3D (Three.js)" colour="290">
  <block type="three_create_scene"></block>
  <block type="three_create_camera">
    <value name="FOV"><shadow type="math_number"><field name="NUM">75</field></shadow></value>
    <value name="NEAR"><shadow type="math_number"><field name="NUM">0.1</field></shadow></value>
    <value name="FAR"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
  </block>
  <block type="three_create_renderer"></block>
  <block type="three_add_light">
    <value name="TYPE"><shadow type="text"><field name="TEXT">point</field></shadow></value>
    <value name="COLOR"><shadow type="text"><field name="TEXT">#ffffff</field></shadow></value>
    <value name="INTENSITY"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
  </block>
  <block type="three_create_mesh">
    <value name="GEOMETRY"><shadow type="text"><field name="TEXT">box</field></shadow></value>
    <value name="WIDTH"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    <value name="HEIGHT"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    <value name="DEPTH"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    <value name="COLOR"><shadow type="text"><field name="TEXT">#00ff00</field></shadow></value>
  </block>
  <block type="three_set_position">
    <value name="OBJECT"><shadow type="text"><field name="TEXT">cube</field></shadow></value>
    <value name="X"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="Z"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
  </block>
  <block type="three_rotate">
    <value name="OBJECT"><shadow type="text"><field name="TEXT">cube</field></shadow></value>
    <value name="X"><shadow type="math_number"><field name="NUM">0.01</field></shadow></value>
    <value name="Y"><shadow type="math_number"><field name="NUM">0.01</field></shadow></value>
    <value name="Z"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
  </block>
  <block type="three_set_camera_position">
    <value name="X"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="Z"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
  </block>
  <block type="three_camera_lookat">
    <value name="X"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="Z"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
  </block>
  <block type="three_render_scene"></block>
  <block type="three_add_physics">
    <value name="OBJECT"><shadow type="text"><field name="TEXT">cube</field></shadow></value>
    <value name="MASS"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
  </block>
  <block type="three_raycast">
    <value name="ORIGIN_X"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="ORIGIN_Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="ORIGIN_Z"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="DIRECTION_X"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="DIRECTION_Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="DIRECTION_Z"><shadow type="math_number"><field name="NUM">-1</field></shadow></value>
  </block>
  <block type="three_load_model">
    <value name="URL"><shadow type="text"><field name="TEXT">model.glb</field></shadow></value>
    <value name="NAME"><shadow type="text"><field name="TEXT">model1</field></shadow></value>
  </block>
  <block type="three_animate_model">
    <value name="NAME"><shadow type="text"><field name="TEXT">model1</field></shadow></value>
    <value name="ANIMATION"><shadow type="text"><field name="TEXT">walk</field></shadow></value>
  </block>
</category>
`;

// React UI Blocks
export const REACT_UI_BLOCKS = `
<category name="⚛️ React UI" colour="160">
  <block type="react_create_component">
    <value name="NAME"><shadow type="text"><field name="TEXT">MyComponent</field></shadow></value>
  </block>
  <block type="react_render_ui">
    <value name="COMPONENT"><shadow type="text"><field name="TEXT">MyComponent</field></shadow></value>
    <value name="X"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
    <value name="Y"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
  </block>
  <block type="react_set_prop">
    <value name="COMPONENT"><shadow type="text"><field name="TEXT">MyComponent</field></shadow></value>
    <value name="PROP"><shadow type="text"><field name="TEXT">text</field></shadow></value>
    <value name="VALUE"><shadow type="text"><field name="TEXT">Hello</field></shadow></value>
  </block>
  <block type="react_get_prop">
    <value name="COMPONENT"><shadow type="text"><field name="TEXT">MyComponent</field></shadow></value>
    <value name="PROP"><shadow type="text"><field name="TEXT">text</field></shadow></value>
  </block>
  <block type="react_use_state">
    <value name="INITIAL"><shadow type="text"><field name="TEXT">0</field></shadow></value>
  </block>
  <block type="react_update_state">
    <value name="STATE_NAME"><shadow type="text"><field name="TEXT">count</field></shadow></value>
    <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
  </block>
  <block type="react_button">
    <value name="TEXT"><shadow type="text"><field name="TEXT">Click Me</field></shadow></value>
  </block>
  <block type="react_text">
    <value name="CONTENT"><shadow type="text"><field name="TEXT">Hello World</field></shadow></value>
  </block>
  <block type="react_div">
    <value name="STYLE"><shadow type="text"><field name="TEXT">{"color": "white"}</field></shadow></value>
  </block>
  <block type="react_sync_game_state">
    <value name="GLOBAL_VAR"><shadow type="text"><field name="TEXT">score</field></shadow></value>
  </block>
</category>
`;

export default {
    PLATFORMER_BLOCKS,
    TOPDOWN_BLOCKS,
    THREEJS_BLOCKS,
    REACT_UI_BLOCKS
};