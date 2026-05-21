<template>
  <LayoutGuest>
    <div class="mo-screen h-screen w-screen flex flex-col p-3 box-border bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <!-- Container for the two cards -->
      <div class="flex flex-1 gap-3 w-full h-full min-h-0">
        
        <!-- ================= LEFT CARD (28% Width) ================= -->
        <div class="w-[28%] h-full bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
          
          <!-- ── Metrics Header ── -->
          <div class="px-4 py-3.5 border-b border-slate-150 dark:border-slate-700/60 flex-shrink-0">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Factory Overview</h2>
            </div>
            <!-- Summary metric chips -->
            <div class="grid grid-cols-4 gap-2">
              <div class="rounded-lg px-2 py-2.5 text-center shadow-sm border border-slate-200/40 dark:border-slate-700/40" style="background: #f8fafc;">
                <div class="text-[18px] md:text-xl font-black text-slate-700 dark:text-slate-200 leading-none mb-0.5">{{ totalMachines }}</div>
                <div class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</div>
              </div>
              <div class="rounded-lg px-2 py-2.5 text-center shadow-sm border border-slate-200/40 dark:border-slate-700/40" :style="{ background: CONFIG.statusColors.OK.bg }">
                <div class="text-[18px] md:text-xl font-black leading-none mb-0.5" :style="{ color: CONFIG.statusColors.OK.text }">{{ totalOk }}</div>
                <div class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider" :style="{ color: CONFIG.statusColors.OK.text, opacity: 0.8 }">OK</div>
              </div>
              <div class="rounded-lg px-2 py-2.5 text-center shadow-sm border border-slate-200/40 dark:border-slate-700/40" :style="{ background: CONFIG.statusColors.WARNING.bg }">
                <div class="text-[18px] md:text-xl font-black leading-none mb-0.5" :style="{ color: CONFIG.statusColors.WARNING.text }">{{ totalWarning }}</div>
                <div class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider" :style="{ color: CONFIG.statusColors.WARNING.text, opacity: 0.8 }">Warn</div>
              </div>
              <div class="rounded-lg px-2 py-2.5 text-center shadow-sm border border-slate-200/40 dark:border-slate-700/40" :style="{ background: CONFIG.statusColors.CRITICAL.bg }">
                <div class="text-[18px] md:text-xl font-black leading-none mb-0.5" :style="{ color: CONFIG.statusColors.CRITICAL.text }">{{ totalCritical }}</div>
                <div class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider" :style="{ color: CONFIG.statusColors.CRITICAL.text, opacity: 0.8 }">Crit</div>
              </div>
            </div>
          </div>

          <!-- ── Scrollable Alert Feed ── -->
          <div class="flex-1 overflow-y-auto">
            <!-- Each production line section (always visible, no accordion) -->
            <div v-for="line in uiLinesData" :key="line.name" class="border-b border-slate-100 dark:border-slate-700/30 last:border-0">
              
              <!-- Line Header -->
              <div class="px-4 py-3 flex items-center justify-between sticky top-0 z-[1] border-b border-slate-200/60 dark:border-slate-700/50 backdrop-blur-md shadow-sm transition-colors"
                   :class="[getLineAccentClass(line.name), { 'cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60': true }]"
                   @click="focusLine(line.name)">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="text-xs md:text-sm font-black tracking-wider text-slate-850 dark:text-slate-100 uppercase">{{ line.name }}</span>
                  <span class="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold bg-slate-200/50 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                    {{ (line.machines || []).length }} Machines
                  </span>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <span v-if="line.counts.CRITICAL > 0" class="inline-flex items-center gap-1 text-[10px] md:text-xs font-black px-2 py-0.5 rounded-full shadow-sm" 
                        :style="{ background: CONFIG.statusColors.CRITICAL.bg, color: CONFIG.statusColors.CRITICAL.text, border: `1px solid ${CONFIG.statusColors.CRITICAL.border}` }">
                    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-ping absolute" :style="{ background: CONFIG.statusColors.CRITICAL.dot }"></span>
                    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 relative" :style="{ background: CONFIG.statusColors.CRITICAL.dot }"></span>
                    {{ line.counts.CRITICAL }}
                  </span>
                  <span v-if="line.counts.WARNING > 0" class="inline-flex items-center gap-1 text-[10px] md:text-xs font-black px-2 py-0.5 rounded-full shadow-sm" 
                        :style="{ background: CONFIG.statusColors.WARNING.bg, color: CONFIG.statusColors.WARNING.text, border: `1px solid ${CONFIG.statusColors.WARNING.border}` }">
                    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ background: CONFIG.statusColors.WARNING.dot }"></span>
                    {{ line.counts.WARNING }}
                  </span>
                </div>
              </div>

              <!-- Alert machines for this line (CRITICAL first, then WARNING) -->
              <div class="px-2 py-2 space-y-2.5">
                <div v-for="machine in getLineAlertMachines(line)" :key="machine.machine_name"
                     @click="showMachineDetails(machine)"
                     class="mx-1 px-3.5 py-3 rounded-lg cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 border shadow-sm"
                     :style="{ 
                       background: CONFIG.statusColors[machine.machine_state]?.bg, 
                       borderColor: CONFIG.statusColors[machine.machine_state]?.border || '#e2e8f0'
                     }">
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" :style="{ background: CONFIG.statusColors[machine.machine_state]?.dot }"></span>
                      <span class="text-xs md:text-sm font-black truncate" :style="{ color: CONFIG.statusColors[machine.machine_state]?.text }">{{ machine.machine_name }}</span>
                    </div>
                    <span class="text-[9px] md:text-[10px] font-black uppercase tracking-wider flex-shrink-0 px-2 py-0.5 rounded-md border"
                          :style="{ color: CONFIG.statusColors[machine.machine_state]?.text, background: CONFIG.statusColors[machine.machine_state]?.bg, borderColor: CONFIG.statusColors[machine.machine_state]?.border }">
                      {{ machine.machine_state }}
                    </span>
                  </div>
                  <!-- Abnormal parameters inline -->
                  <div class="space-y-1.5 mt-2 pt-2 border-t border-dashed" :style="{ borderColor: CONFIG.statusColors[machine.machine_state]?.border }">
                    <div v-for="param in getAbnormalParameters(machine)" :key="param.actual_parameter_name" class="ml-1.5 flex items-center justify-between">
                      <span class="text-[10px] md:text-xs text-slate-700 dark:text-slate-355 font-bold truncate flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                        {{ param.actual_parameter_name }}
                      </span>
                      <span class="text-[10px] md:text-xs font-black font-mono ml-2 flex-shrink-0 px-1.5 py-0.5 rounded animate-pulse" :style="{ color: CONFIG.statusColors[param.parameter_state]?.text || CONFIG.statusColors[machine.machine_state]?.text, background: CONFIG.statusColors[param.parameter_state]?.bg || 'rgba(0,0,0,0.03)' }">
                        {{ param.parameter_value !== null ? param.parameter_value : 'N/A' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= RIGHT CARD (72% Width - Isometric SVG) ================= -->
        <div class="w-[72%] h-full bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden relative">
          
          <div class="w-full h-full relative p-4 flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            
            <!-- Glassmorphic Loading HUD overlaying the active machine layout -->
            <div v-if="isLoading" class="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center z-20 pointer-events-none">
              <div class="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-lg pointer-events-auto">
                <svg class="animate-spin h-5 w-5 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide">
                  Loading Live Factory Layout...
                </span>
              </div>
            </div>

            <!-- Isometric SVG Stage -->
            <svg ref="svgRef" :viewBox="computedViewBox" @wheel.prevent="handleWheel" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseLeave" preserveAspectRatio="xMidYMid meet" class="w-full h-full select-none outline-none">
              
              <defs>
                <filter id="base-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
                </filter>
              </defs>

              <!-- 1. BACKDROP GRID -->
              <g :stroke="CONFIG.gridLineColor" :stroke-width="CONFIG.gridLineWidth" fill="none">
                <line v-for="u in gridUValues" :key="'grid-u-' + u"
                  :x1="isoToScreen(u, CONFIG.gridMin).x" :y1="isoToScreen(u, CONFIG.gridMin).y"
                  :x2="isoToScreen(u, CONFIG.gridMax).x" :y2="isoToScreen(u, CONFIG.gridMax).y"/>
                <line v-for="v in gridVValues" :key="'grid-v-' + v"
                  :x1="isoToScreen(CONFIG.gridMin, v).x" :y1="isoToScreen(CONFIG.gridMin, v).y"
                  :x2="isoToScreen(CONFIG.gridMax, v).x" :y2="isoToScreen(CONFIG.gridMax, v).y"/>
              </g>

              <!-- 1.5. ISOMETRIC LINE LABELS (flat on floor, parallel to U-axis) -->
              <g v-for="label in lineLabels" :key="label.name">
                <!-- Slanted Black Background Box (runs parallel to U-axis, styled dynamically via config) -->
                <polygon v-if="label.box"
                  :points="`
                    ${isoToScreen(label.u - label.halfWidth, label.v - label.halfHeight).x},${isoToScreen(label.u - label.halfWidth, label.v - label.halfHeight).y}
                    ${isoToScreen(label.u + label.halfWidth, label.v - label.halfHeight).x},${isoToScreen(label.u + label.halfWidth, label.v - label.halfHeight).y}
                    ${isoToScreen(label.u + label.halfWidth, label.v + label.halfHeight).x},${isoToScreen(label.u + label.halfWidth, label.v + label.halfHeight).y}
                    ${isoToScreen(label.u - label.halfWidth, label.v + label.halfHeight).x},${isoToScreen(label.u - label.halfWidth, label.v + label.halfHeight).y}
                  `"
                  :fill="label.bgColor"
                  :stroke="label.borderColor"
                  :stroke-width="label.borderWidth"
                />
                <!-- Slanted White Text (rotated flat along U-axis, styled dynamically via config) -->
                <text 
                  :transform="`matrix(0.7, 0.35, -0.7, 0.35, ${isoToScreen(label.u - label.halfWidth + label.textPadding, label.v).x}, ${isoToScreen(label.u - label.halfWidth + label.textPadding, label.v).y})`"
                  text-anchor="start"
                  dominant-baseline="central"
                  :fill="label.textColor"
                  :font-size="label.fontSize"
                  :font-weight="label.fontWeight"
                  :letter-spacing="label.letterSpacing"
                  :font-family="CONFIG.fontFamily"
                >{{ label.name }}</text>
              </g>

              <!-- 2. MACHINE IMAGES + TOOLTIPS (depth-sorted) -->
              <g v-for="machine in sortedPlacedMachines" :key="machine.machine_name"
                 :style="{ 
                   cursor: isLoading ? 'default' : 'pointer'
                 }"
                 :opacity="activeLine && activeLine !== machine.lineName ? 0.25 : 1.0"
                 @mouseenter="!isLoading && (hoveredMachine = machine.machine_name)"
                 @mouseleave="hoveredMachine = null"
                 @click.stop="!isLoading && showMachineDetails(machine)">
                
                <!-- ── 3D ISOMETRIC PLATFORM (BASE) ── -->
                <!-- Base Glow Shadow (Rhombus) -->
                <polygon v-if="!isLoading && getPlatformColors(machine.machine_state).hasGlow"
                         :points="`
                           ${getMachineX(machine) + CONFIG.machineWidth/2 - rx - 4},${getMachineY(machine) + anchorY + h + 1}
                           ${getMachineX(machine) + CONFIG.machineWidth/2},${getMachineY(machine) + anchorY + h + ry + 2 + 1}
                           ${getMachineX(machine) + CONFIG.machineWidth/2 + rx + 4},${getMachineY(machine) + anchorY + h + 1}
                           ${getMachineX(machine) + CONFIG.machineWidth/2},${getMachineY(machine) + anchorY + h - ry - 2 + 1}
                         `"
                         :fill="getPlatformColors(machine.machine_state).glow" 
                         opacity="0.65" 
                         filter="url(#base-glow-filter)" />

                <!-- Base 3D Left Side Wall -->
                <path v-if="!isLoading"
                      :d="`M ${getMachineX(machine) + CONFIG.machineWidth/2 - rx} ${getMachineY(machine) + anchorY}
                           L ${getMachineX(machine) + CONFIG.machineWidth/2} ${getMachineY(machine) + anchorY + ry}
                           L ${getMachineX(machine) + CONFIG.machineWidth/2} ${getMachineY(machine) + anchorY + ry + h}
                           L ${getMachineX(machine) + CONFIG.machineWidth/2 - rx} ${getMachineY(machine) + anchorY + h}
                           Z`"
                      :fill="getPlatformColors(machine.machine_state).sideLeft"
                      :stroke="getPlatformColors(machine.machine_state).stroke"
                      stroke-width="0.8" />

                <!-- Base 3D Right Side Wall -->
                <path v-if="!isLoading"
                      :d="`M ${getMachineX(machine) + CONFIG.machineWidth/2} ${getMachineY(machine) + anchorY + ry}
                           L ${getMachineX(machine) + CONFIG.machineWidth/2 + rx} ${getMachineY(machine) + anchorY}
                           L ${getMachineX(machine) + CONFIG.machineWidth/2 + rx} ${getMachineY(machine) + anchorY + h}
                           L ${getMachineX(machine) + CONFIG.machineWidth/2} ${getMachineY(machine) + anchorY + ry + h}
                           Z`"
                      :fill="getPlatformColors(machine.machine_state).sideRight"
                      :stroke="getPlatformColors(machine.machine_state).stroke"
                      stroke-width="0.8" />

                <!-- Base Top Face (Rhombus) -->
                <polygon v-if="!isLoading"
                         :points="`
                           ${getMachineX(machine) + CONFIG.machineWidth/2 - rx},${getMachineY(machine) + anchorY}
                           ${getMachineX(machine) + CONFIG.machineWidth/2},${getMachineY(machine) + anchorY - ry}
                           ${getMachineX(machine) + CONFIG.machineWidth/2 + rx},${getMachineY(machine) + anchorY}
                           ${getMachineX(machine) + CONFIG.machineWidth/2},${getMachineY(machine) + anchorY + ry}
                         `"
                         :fill="getPlatformColors(machine.machine_state).top"
                         :stroke="getPlatformColors(machine.machine_state).stroke"
                         stroke-width="0.8" />

                <!-- Nested Group for Machine + Tooltip scaling together on hover -->
                <g
                  :style="{ 
                    transformOrigin: `${getMachineX(machine) + CONFIG.machineWidth/2}px ${getMachineY(machine) + anchorY}px`,
                    transform: (!isLoading && hoveredMachine === machine.machine_name) ? `scale(${CONFIG.hoverScale || 1.15})` : 'scale(1)',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }"
                >
                  <!-- Machine Image (sitting on platform) -->
                  <image 
                    :href="machineSvg"
                    :x="getMachineX(machine)"
                    :y="getMachineY(machine)"
                    :width="CONFIG.machineWidth"
                    :height="CONFIG.machineHeight"
                    :class="{ 'loading-machine': isLoading }"
                    :style="{ 
                      filter: isLoading ? 'grayscale(0.5) contrast(0.9)' : (CONFIG.useFilters ? (getMachineFilter(machine.machine_state) || '') : 'none')
                    }"
                  />

                  <!-- ── HIGH-CONTRAST TOOLTIP LABEL ── -->
                  <g v-if="shouldShowTooltip(machine)">
                    <!-- Shadowed Tooltip Path (Sharp corners + bottom arrow tip) -->
                    <path 
                      :d="getTooltipPath(machine)"
                      :fill="CONFIG.tooltipBgColor || '#090d16'"
                      :stroke="getTooltipStroke(machine)"
                      stroke-width="1.8"
                      opacity="0.96"
                    />
                    <!-- Tooltip Text centered inside the box using original font stack -->
                    <text 
                      :x="getMachineX(machine) + CONFIG.machineWidth/2"
                      :y="getMachineY(machine) - CONFIG.tooltipOffsetY + 2"
                      text-anchor="middle"
                      dominant-baseline="central"
                      :fill="CONFIG.tooltipTextColor || '#ffffff'"
                      font-size="10.5"
                      font-weight="800"
                      :font-family="CONFIG.fontFamily"
                    >{{ machine.machine_name }}</text>
                  </g>
                </g>
              </g>
            </svg>
            
            <!-- Glassmorphic Zoom Controls HUD -->
            <div class="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-md z-10 select-none">
              <button @click="zoomOut" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-colors flex items-center justify-center" title="Zoom Out">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                </svg>
              </button>
              <span class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 min-w-[45px] text-center">
                {{ Math.round(zoomScale * 100) }}%
              </span>
              <button @click="zoomIn" class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-colors flex items-center justify-center" title="Zoom In">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <div class="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button @click="resetZoom" class="px-2 py-1 rounded text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-400 transition-colors" title="Fit All Machines">
                Fit
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- ================= MACHINE DETAILS MODAL ================= -->
      <div v-if="selectedMachine" class="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center z-50" @click.self="selectedMachine = null">
        <div class="bg-white dark:bg-slate-900 rounded-lg p-5 max-w-lg w-full max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          
          <!-- Modal Header -->
          <div class="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold text-slate-850 dark:text-slate-100">{{ selectedMachine.machine_name }}</h2>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      :style="{ background: CONFIG.statusColors[selectedMachine.machine_state]?.bg, color: CONFIG.statusColors[selectedMachine.machine_state]?.text, border: `1px solid ${CONFIG.statusColors[selectedMachine.machine_state]?.border}` }">
                  {{ selectedMachine.machine_state }}
                </span>
              </div>
              <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Line: {{ selectedMachine.lineName }}</p>
            </div>
            <button @click="selectedMachine = null" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Content: Only Abnormal Parameters -->
          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            <div v-if="selectedMachineAlerts.length === 0" class="text-center py-6">
              <div class="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" :style="{ background: CONFIG.statusColors.OK.bg }">
                <svg class="w-5 h-5" :style="{ color: CONFIG.statusColors.OK.text }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-slate-500">All parameters OK</p>
              <p class="text-[10px] text-slate-400 mt-0.5">No warnings or critical alerts detected.</p>
            </div>
            
            <div v-else>
              <h3 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Abnormal Parameters</h3>
              <div v-for="param in selectedMachineAlerts" :key="param.actual_parameter_name" 
                   @click="logParameterDetails(param, selectedMachine.machine_name, getParameterGroup(selectedMachine.machine_name, param.internal_parameter_name))"
                   class="p-3 rounded-md cursor-pointer transition-all duration-150 hover:shadow-sm mb-1.5"
                   :style="{ 
                     background: CONFIG.statusColors[param.parameter_state]?.bg, 
                     border: `1px solid ${CONFIG.statusColors[param.parameter_state]?.border}` 
                   }">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: CONFIG.statusColors[param.parameter_state]?.dot }"></span>
                    <span class="text-[11px] font-bold truncate" :style="{ color: CONFIG.statusColors[param.parameter_state]?.text }">{{ param.actual_parameter_name }}</span>
                  </div>
                  <span class="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
                        :style="{ color: CONFIG.statusColors[param.parameter_state]?.text, background: CONFIG.statusColors[param.parameter_state]?.border }">
                    {{ param.parameter_state }}
                  </span>
                </div>
                <div class="mt-2 grid grid-cols-3 gap-2">
                  <div>
                    <div class="text-[8px] text-slate-400 uppercase">Value</div>
                    <div class="text-[13px] font-black font-mono" :style="{ color: CONFIG.statusColors[param.parameter_state]?.text }">
                      {{ param.parameter_value !== null ? param.parameter_value : 'N/A' }}
                    </div>
                  </div>
                  <div>
                    <div class="text-[8px] text-slate-400 uppercase">Warn</div>
                    <div class="text-[11px] font-bold font-mono text-slate-600">{{ param.warning_limit || '—' }}</div>
                  </div>
                  <div>
                    <div class="text-[8px] text-slate-400 uppercase">Crit</div>
                    <div class="text-[11px] font-bold font-mono text-slate-600">{{ param.critical_limit || '—' }}</div>
                  </div>
                </div>
                <div class="mt-1.5 text-[8px] text-slate-400 text-right">
                  Last sync: {{ formatDate(param.latest_update_time) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 flex justify-end">
            <button @click="selectedMachine = null" 
                    class="bg-slate-900 text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-650 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>

    </div>
  </LayoutGuest>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

// LAYOUT & APIS
import LayoutGuest from "@/layouts/LayoutGuest.vue";
import machineSvg from '@/assets/shopfloor/mch.svg';

// PINIA STORES
import { useFactoryOverviewStore } from '../stores/FactoryOverviewStore';
import { useFactoryPollOverviewStore } from '../stores/FactoryPollGridStore';
import { useMachineSamplingWithLimitsStore } from '@/stores/MachineSamplingWithLimitsStore'; 
import { useNavigationHistoryStore } from '../stores/navigationHistoryStore';

// MAIN ISOMETRIC CONFIGURATION
import { CONFIG } from './ManagerialOverviewConfig';

// ── 3D Isometric Platform Geometry & Color Helpers ──
const rx = 70;
const ry = 35;
const h = 3.5;
const anchorY = CONFIG.machineHeight * (1 - CONFIG.machineAnchorYPercent);

const getPlatformColors = (state) => {
  const mapping = {
    'OK': {
      top: '#f8fafc',
      sideLeft: '#cbd5e1',
      sideRight: '#e2e8f0',
      stroke: '#cbd5e1',
      glow: 'transparent',
      hasGlow: false
    },
    'WARNING': {
      top: '#f59e0b',
      sideLeft: '#b45309',
      sideRight: '#d97706',
      stroke: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.35)',
      hasGlow: true
    },
    'CRITICAL': {
      top: '#ef4444',
      sideLeft: '#991b1b',
      sideRight: '#b91c1c',
      stroke: '#f87171',
      glow: 'rgba(239, 68, 68, 0.5)',
      hasGlow: true
    },
    'DISCONNECTED': {
      top: '#94a3b8',
      sideLeft: '#475569',
      sideRight: '#64748b',
      stroke: '#cbd5e1',
      glow: 'rgba(148, 163, 184, 0.2)',
      hasGlow: true
    }
  };
  return mapping[state] || mapping['OK'];
};

const getBeaconColors = (state) => {
  const mapping = {
    'WARNING': {
      top: '#fbbf24', // bright amber
      left: '#d97706', // darker amber
      right: '#f59e0b', // main amber
      glow: '#f59e0b'
    },
    'CRITICAL': {
      top: '#f87171', // bright red
      left: '#b91c1c', // darker red
      right: '#ef4444', // main red
      glow: '#ef4444'
    },
    'DISCONNECTED': {
      top: '#cbd5e1', // bright grey
      left: '#64748b', // darker grey
      right: '#94a3b8', // main grey
      glow: '#94a3b8'
    },
    'OK': {
      top: '#34d399',
      left: '#059669',
      right: '#10b981',
      glow: '#10b981'
    }
  };
  return mapping[state] || mapping['OK'];
};

const getMachineFilter = (state) => {
  if (state === 'WARNING') {
    return 'sepia(0.25) saturate(1.4) hue-rotate(0deg) brightness(1.02)';
  } else if (state === 'CRITICAL') {
    return 'sepia(0.35) saturate(1.8) hue-rotate(320deg) brightness(0.94)';
  } else if (state === 'DISCONNECTED') {
    return 'grayscale(0.85) contrast(0.80) saturate(0.1)';
  }
  return 'none';
};

const getStatusColor = (state) => {
  const mapping = {
    'WARNING': '#f59e0b',
    'CRITICAL': '#ef4444',
    'DISCONNECTED': '#94a3b8',
    'OK': '#10b981'
  };
  return mapping[state] || '#10b981';
};

// ── Load Google Font dynamically from config ──
onBeforeMount(() => {
  if (CONFIG.fontUrl) {
    const existing = document.querySelector(`link[href="${CONFIG.fontUrl}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CONFIG.fontUrl;
      document.head.appendChild(link);
    }
  }
});

// ── Grid iteration arrays ──
const gridUValues = computed(() => {
  const arr = [];
  for (let u = CONFIG.gridMin; u <= CONFIG.gridMax; u++) arr.push(u);
  return arr;
});
const gridVValues = computed(() => {
  const arr = [];
  for (let v = CONFIG.gridMin; v <= CONFIG.gridMax; v++) arr.push(v);
  return arr;
});

// ── Reactive state ──
const router = useRouter();
const factoryStore = useFactoryOverviewStore();
const factoryPollStore = useFactoryPollOverviewStore();
const machineSamplingWithLimitsStore = useMachineSamplingWithLimitsStore();
const navigationHistoryStore = useNavigationHistoryStore();

const svgRef = ref(null);
const activeLine = ref(null);
const selectedMachine = ref(null);
const hoveredMachine = ref(null);
const isLoading = ref(true);

// ── Skeleton mock data (generated from defaultLineMachines config) ──
const defaultLineNames = ['BLOCK', 'CRANK', 'HEAD'];
const skeletonLinesData = computed(() => {
  const counts = CONFIG.defaultLineMachines || [7, 14, 38];
  return counts.map((count, i) => ({
    name: defaultLineNames[i] || `LINE_${i + 1}`,
    counts: { OK: count, WARNING: 0, CRITICAL: 0, DISCONNECTED: 0 },
    machines: Array.from({ length: count }, (_, j) => ({
      machine_name: `${defaultLineNames[i] || 'L' + i}_OP${(j + 1) * 10}`,
      machine_state: 'OK',
      lineName: defaultLineNames[i] || `LINE_${i + 1}`,
      parameters: []
    })),
    alerts: []
  }));
});

// ── Coordinate transformation ──
const isoToScreen = (u, v) => {
  const x = CONFIG.originX + (u - v) * (CONFIG.tileWidth / 2);
  const y = CONFIG.originY + (u + v) * (CONFIG.tileHeight / 2);
  return { x, y };
};

// ── Zoom & Pan ──
const zoomScale = ref(1.0);
const viewBoxX = ref(0);
const viewBoxY = ref(0);
const viewBoxW = ref(1200);
const viewBoxH = ref(800);
const isPanning = ref(false);
const startX = ref(0);
const startY = ref(0);

const computedViewBox = computed(() => `${viewBoxX.value} ${viewBoxY.value} ${viewBoxW.value} ${viewBoxH.value}`);

const handleMouseDown = (event) => {
  if (event.button === 1) {
    event.preventDefault();
    isPanning.value = true;
    startX.value = event.clientX;
    startY.value = event.clientY;
  }
};
const handleMouseMove = (event) => {
  if (!isPanning.value) return;
  event.preventDefault();
  const dx = event.clientX - startX.value;
  const dy = event.clientY - startY.value;
  startX.value = event.clientX;
  startY.value = event.clientY;
  const svg = event.currentTarget;
  const rect = svg.getBoundingClientRect();
  viewBoxX.value -= dx * (viewBoxW.value / rect.width);
  viewBoxY.value -= dy * (viewBoxH.value / rect.height);
};
const handleMouseUp = (event) => { if (event.button === 1) isPanning.value = false; };
const handleMouseLeave = () => { isPanning.value = false; };

const handleWheel = (event) => {
  event.preventDefault();
  const svg = event.currentTarget;
  const rect = svg.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const svgMouseX = viewBoxX.value + (mouseX / rect.width) * viewBoxW.value;
  const svgMouseY = viewBoxY.value + (mouseY / rect.height) * viewBoxH.value;
  const zoomFactor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
  const newScale = Math.max(0.4, Math.min(6.0, zoomScale.value * zoomFactor));
  if (newScale === zoomScale.value) return;
  const newW = 1200 / newScale;
  const newH = 800 / newScale;
  viewBoxX.value = svgMouseX - (mouseX / rect.width) * newW;
  viewBoxY.value = svgMouseY - (mouseY / rect.height) * newH;
  zoomScale.value = newScale;
  viewBoxW.value = newW;
  viewBoxH.value = newH;
};

const zoomToScale = (targetScale) => {
  const newScale = Math.max(0.4, Math.min(6.0, targetScale));
  if (newScale === zoomScale.value) return;
  const cx = viewBoxX.value + viewBoxW.value / 2;
  const cy = viewBoxY.value + viewBoxH.value / 2;
  const newW = 1200 / newScale;
  const newH = 800 / newScale;
  viewBoxX.value = cx - newW / 2;
  viewBoxY.value = cy - newH / 2;
  zoomScale.value = newScale;
  viewBoxW.value = newW;
  viewBoxH.value = newH;
};
const zoomIn = () => zoomToScale(zoomScale.value * 1.25);
const zoomOut = () => zoomToScale(zoomScale.value / 1.25);
const resetZoom = () => fitView();

const fitView = () => {
  const machines = placedMachines.value;
  if (machines.length === 0) {
    zoomScale.value = 1.0; viewBoxX.value = 0; viewBoxY.value = 0; viewBoxW.value = 1200; viewBoxH.value = 800;
    return;
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  machines.forEach(m => {
    const x = getMachineX(m), y = getMachineY(m);
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + CONFIG.machineWidth); maxY = Math.max(maxY, y + CONFIG.machineHeight);
  });
  const pad = CONFIG.viewPadding || 80;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const bw = maxX - minX, bh = maxY - minY;
  const ar = 1200 / 800;
  let fitW, fitH;
  if (bw / bh > ar) { fitW = bw; fitH = bw / ar; } else { fitH = bh; fitW = bh * ar; }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  viewBoxX.value = cx - fitW / 2; viewBoxY.value = cy - fitH / 2;
  viewBoxW.value = fitW; viewBoxH.value = fitH; zoomScale.value = 1200 / fitW;
};

// ── Data mapping ──
const uiLinesData = computed(() => {
  const rawLines = factoryStore.formattedOverviewData?.lines || [];
  if (rawLines.length === 0) return skeletonLinesData.value;

  return rawLines.map(line => {
    const name = line.line_name;
    const machines = (line.machines || []).map(m => ({ ...m, lineName: name }));
    const counts = { OK: 0, WARNING: 0, CRITICAL: 0, DISCONNECTED: 0 };
    machines.forEach(m => {
      const s = m.machine_state || 'OK';
      if (counts[s] !== undefined) counts[s]++;
    });
    const alerts = [];
    machines.forEach(m => {
      (m.parameters || []).forEach(p => {
        if (p.parameter_state !== 'OK') {
          alerts.push({ machineName: m.machine_name, paramName: p.actual_parameter_name, value: `${p.parameter_value}`, state: p.parameter_state });
        }
      });
    });
    return { name, counts, machines, alerts };
  });
});

// ── Computed metrics ──
const totalMachines = computed(() => uiLinesData.value.reduce((s, l) => s + (l.machines || []).length, 0));
const totalOk = computed(() => uiLinesData.value.reduce((s, l) => s + (l.counts.OK || 0), 0));
const totalWarning = computed(() => uiLinesData.value.reduce((s, l) => s + (l.counts.WARNING || 0), 0));
const totalCritical = computed(() => uiLinesData.value.reduce((s, l) => s + (l.counts.CRITICAL || 0), 0));

// ── Machine placement ──
const placedMachines = computed(() => {
  const list = [];
  const spacing = CONFIG.machineSpacing || 1.0;
  const lineGap = CONFIG.lineGap !== undefined ? CONFIG.lineGap : 1;
  const perRow = CONFIG.machinesPerRow || 10;
  let currentU = 0;

  uiLinesData.value.forEach(line => {
    const machines = line.machines || [];
    const rows = Math.ceil(machines.length / perRow) || 1;
    machines.forEach((m, idx) => {
      const row = Math.floor(idx / perRow);
      const col = idx % perRow;
      list.push({ ...m, lineName: m.lineName || line.name, gridU: currentU + row * spacing, gridV: col * spacing });
    });
    currentU += (rows - 1) * spacing + 1 + lineGap;
  });
  return list;
});

const sortedPlacedMachines = computed(() => [...placedMachines.value].sort((a, b) => (a.gridU + a.gridV) - (b.gridU + b.gridV)));

const lineLabels = computed(() => {
  const labels = [];
  const spacing = CONFIG.machineSpacing || 1.0;
  const lineGap = CONFIG.lineGap !== undefined ? CONFIG.lineGap : 1;
  const perRow = CONFIG.machinesPerRow || 10;
  const settings = CONFIG.lineLabelSettings || {};
  const lineSettings = settings.lines || {};
  let currentU = 0;

  uiLinesData.value.forEach(line => {
    const machines = line.machines || [];
    if (machines.length === 0) return;
    const rows = Math.ceil(machines.length / perRow) || 1;

    const nameKey = line.name.toUpperCase();
    const configForLine = lineSettings[nameKey] || {};

    // Center of the U span
    let uCenter = currentU + (rows * spacing) / 2;
    // Place right above the boundary line (v = 0)
    let vCenter = -0.22;

    // Apply manual overrides
    const uOffset = configForLine.uOffset !== undefined ? configForLine.uOffset : 0.0;
    const vOffset = configForLine.vOffset !== undefined ? configForLine.vOffset : 0.0;
    uCenter += uOffset;
    vCenter += vOffset;

    const boxVisible = configForLine.box !== undefined ? configForLine.box : (settings.box !== undefined ? settings.box : true);
    const boxWidthVal = configForLine.width !== undefined ? configForLine.width : (settings.width !== undefined ? settings.width : (configForLine.boxWidth !== undefined ? configForLine.boxWidth : (settings.boxWidth !== undefined ? settings.boxWidth : 1.3)));
    const boxHeightVal = configForLine.height !== undefined ? configForLine.height : (settings.height !== undefined ? settings.height : (configForLine.boxHeight !== undefined ? configForLine.boxHeight : (settings.boxHeight !== undefined ? settings.boxHeight : 0.44)));
    const textPaddingVal = configForLine.textPadding !== undefined ? configForLine.textPadding : (settings.textPadding !== undefined ? settings.textPadding : 0.08);

    labels.push({
      name: configForLine.text || line.name.toUpperCase(),
      u: uCenter,
      v: vCenter,
      textColor: configForLine.textColor || settings.textColor || '#ffffff',
      bgColor: configForLine.bgColor || settings.bgColor || '#000000',
      borderColor: configForLine.borderColor || settings.borderColor || '#ffffff',
      fontSize: settings.fontSize || 14.5,
      fontWeight: settings.fontWeight || '900',
      letterSpacing: settings.letterSpacing || '1.5px',
      borderWidth: settings.borderWidth || 2,
      box: boxVisible,
      halfWidth: boxWidthVal / 2,
      halfHeight: boxHeightVal / 2,
      textPadding: textPaddingVal
    });

    currentU += (rows - 1) * spacing + 1 + lineGap;
  });
  return labels;
});


// ── Position helpers ──
const getMachineX = (machine) => {
  const uOff = CONFIG.machineGridUOffset ?? 0.5, vOff = CONFIG.machineGridVOffset ?? 0.5;
  const pxOff = CONFIG.machinePixelOffsetX ?? 0;
  return isoToScreen(machine.gridU + uOff, machine.gridV + vOff).x - CONFIG.machineWidth / 2 + pxOff;
};
const getMachineY = (machine) => {
  const uOff = CONFIG.machineGridUOffset ?? 0.5, vOff = CONFIG.machineGridVOffset ?? 0.5;
  const pxOff = CONFIG.machinePixelOffsetY ?? 0;
  const anchorY = CONFIG.machineHeight * (1 - CONFIG.machineAnchorYPercent);
  return isoToScreen(machine.gridU + uOff, machine.gridV + vOff).y - anchorY + pxOff;
};

// ── Tooltip helpers ──
const getTooltipWidth = (text) => {
  // Balanced dimensions for 'Manrope' to prevent touching the side borders
  const charWidth = 7.0;
  const paddingX = 24; // Premium horizontal padding
  return Math.max(56, (text || '').length * charWidth + paddingX);
};

const shouldShowTooltip = (machine) => {
  if (isLoading.value) return false;
  if (machine.machine_state === 'WARNING' || machine.machine_state === 'CRITICAL') return true;
  return hoveredMachine.value === machine.machine_name;
};

const getTooltipPath = (machine) => {
  const name = machine.machine_name;
  const w = getTooltipWidth(name);
  const h = 26; // Generous vertical padding for the standard font to prevent touching borders
  const arrow = CONFIG.tooltipArrowSize || 5;
  const r = CONFIG.tooltipCornerRadius !== undefined ? CONFIG.tooltipCornerRadius : 0;
  const cx = getMachineX(machine) + CONFIG.machineWidth / 2;
  const top = getMachineY(machine) - CONFIG.tooltipOffsetY - 11; // Perfectly centered relative to text (top + h/2 = +2 offset)
  const bottom = top + h;
  const left = cx - w / 2;
  const right = cx + w / 2;

  if (r <= 0) {
    return `M ${left} ${top} L ${right} ${top} L ${right} ${bottom} L ${cx + arrow} ${bottom} L ${cx} ${bottom + arrow} L ${cx - arrow} ${bottom} L ${left} ${bottom} Z`;
  } else {
    return `M ${left + r} ${top} L ${right - r} ${top} Q ${right} ${top} ${right} ${top + r} L ${right} ${bottom - r} Q ${right} ${bottom} ${right - r} ${bottom} L ${cx + arrow} ${bottom} L ${cx} ${bottom + arrow} L ${cx - arrow} ${bottom} L ${left + r} ${bottom} Q ${left} ${bottom} ${left} ${bottom - r} L ${left} ${top + r} Q ${left} ${top} ${left + r} ${top} Z`;
  }
};

const getTooltipBg = (machine) => {
  return 'rgba(15, 23, 42, 0.96)';
};
const getTooltipStroke = (machine) => {
  const state = machine.machine_state;
  if (state === 'CRITICAL') return '#ef4444';
  if (state === 'WARNING') return '#f59e0b';
  if (state === 'DISCONNECTED') return '#94a3b8';
  return 'rgba(148, 163, 184, 0.3)';
};
const getTooltipTextColor = (machine) => {
  const state = machine.machine_state;
  if (state === 'CRITICAL') return '#ff6b6b';
  if (state === 'WARNING') return '#fbbf24';
  if (state === 'DISCONNECTED') return '#94a3b8';
  return '#ffffff';
};

// ── Line helpers ──
const focusLine = (lineName) => {
  activeLine.value = activeLine.value === lineName ? null : lineName;
};

function getLineAccentClass(name) {
  const mapping = {
    'BLOCK': 'border-l-4 border-sky-500 dark:border-sky-400 bg-sky-50/20 dark:bg-sky-950/5',
    'CRANK': 'border-l-4 border-indigo-500 dark:border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/5',
    'HEAD': 'border-l-4 border-violet-500 dark:border-violet-400 bg-violet-50/20 dark:bg-violet-950/5'
  };
  return mapping[name.toUpperCase()] || 'border-l-4 border-slate-450 bg-slate-50/25';
}

function getLineAlertMachines(line) {
  const machines = line.machines || [];
  const critical = machines.filter(m => m.machine_state === 'CRITICAL');
  const warning = machines.filter(m => m.machine_state === 'WARNING');
  return [...critical, ...warning];
}

function getAbnormalParameters(machine) {
  return (machine.parameters || []).filter(p => p.parameter_state !== 'OK');
}

// ── Modal computed ──
const selectedMachineAlerts = computed(() => {
  if (!selectedMachine.value) return [];
  return (selectedMachine.value.parameters || []).filter(p => p.parameter_state !== 'OK');
});

function showMachineDetails(machine) {
  selectedMachine.value = machine;
}

// ── Utility styling ──
function getStatusTextColor(state) {
  return {
    'text-red-500 font-bold': state === 'CRITICAL',
    'text-amber-500 font-bold': state === 'WARNING',
    'text-emerald-500 font-bold': state === 'OK',
    'text-slate-400': !state || state === 'DISCONNECTED'
  };
}

function formatDate(timestamp) {
  if (!timestamp) return 'Just now';
  return new Date(timestamp).toLocaleTimeString();
}

function logParameterDetails(param, machineName, parameterGroup) {
  const details = { machine: machineName, actualParameterName: param.actual_parameter_name, parameterGroup };
  machineSamplingWithLimitsStore.setMachineDetails(details);
  machineSamplingWithLimitsStore.setLastSelectedParameter(details);
  navigationHistoryStore.addToHistory(router.currentRoute.value);
  router.push('/machine-level-sampling');
}

function getParameterGroup(machineName, parameterName) {
  const group = factoryPollStore.groupData?.find(g =>
    g.group_details?.some(line =>
      line.machines?.some(machine =>
        machine.machine_name === machineName &&
        machine.parameters?.some(p => p.internal_parameter_name === parameterName)
      )
    )
  );
  return group ? group.group_name : 'Unknown Group';
}

// ── Lifecycle ──
onMounted(async () => {
  // Initial fit with skeleton data
  await nextTick();
  fitView();

  try {
    await factoryStore.fetchAndFormatData();
  } catch (error) {
    console.warn('Real-time API unavailable, loading fallback simulation.');
  }

  isLoading.value = false;

  // Re-fit after real data loads
  await nextTick();
  fitView();
});
</script>

<style scoped>
.mo-screen,
.mo-screen * {
  font-family: v-bind('CONFIG.fontFamily') !important;
}

@keyframes pulse-shimmer {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
}
.loading-machine {
  animation: pulse-shimmer 1.8s ease-in-out infinite;
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { @apply bg-slate-50 dark:bg-slate-800/20; }
::-webkit-scrollbar-thumb { @apply bg-slate-300 dark:bg-slate-700 rounded; }
::-webkit-scrollbar-thumb:hover { @apply bg-slate-400 dark:bg-slate-600; }
</style>