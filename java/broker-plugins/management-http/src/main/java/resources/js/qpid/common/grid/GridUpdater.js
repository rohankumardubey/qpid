/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */


define(["dojo/_base/xhr",
        "dojo/parser",
        "dojo/_base/array",
        "dojo/_base/lang",
        "qpid/common/properties",
        "qpid/common/updater",
        "qpid/common/UpdatableStore",
        "qpid/common/util",
        "dojo/store/Memory",
        "dojo/data/ObjectStore",
        "qpid/common/grid/EnhancedFilter",
        "dojox/grid/enhanced/plugins/NestedSorting",
        "dojo/domReady!"],
       function (xhr, parser, array, lang, properties, updater, UpdatableStore, util, Memory, ObjectStore) {

           function GridUpdater(args, store) {
             this.updatable = args.hasOwnProperty("updatable") ? args.updatable : true ;
             this.serviceUrl = args.serviceUrl;

             this.onUpdate = args.onUpdate;

             this.appendData = args.append;
             this.appendLimit = args.appendLimit;
             this.initialData = args.data;
             this.initializeStore(store);
           };

           GridUpdater.prototype.buildUpdatableGridArguments = function(args)
           {
             var filterPluginFound = args && args.hasOwnProperty("plugins") && args.plugins.filter ? true: false;

             var gridProperties = {
                 autoHeight: true,
                 plugins: {
                   pagination: {
                     defaultPageSize: 25,
                     pageSizes: [10, 25, 50, 100],
                     description: true,
                     sizeSwitch: true,
                     pageStepper: true,
                     gotoButton: true,
                     maxPageStep: 4,
                     position: "bottom"
                 },
                 enhancedFilter: {
                     disableFiltering: filterPluginFound
                 }
                }
             };

             if(args)
             {
               for(var argProperty in args)
               {
                   if(args.hasOwnProperty(argProperty))
                   {
                       if (argProperty == "plugins")
                       {
                         var argPlugins = args[ argProperty ];
                         for(var argPlugin in argPlugins)
                         {
                           if(argPlugins.hasOwnProperty(argPlugin))
                           {
                             var argPluginProperties = argPlugins[ argPlugin ];
                             if (argPluginProperties && gridProperties.plugins.hasOwnProperty(argPlugin))
                             {
                               var gridPlugin = gridProperties.plugins[ argPlugin ];
                               for(var pluginProperty in argPluginProperties)
                               {
                                 if(argPluginProperties.hasOwnProperty(pluginProperty))
                                 {
                                   gridPlugin[pluginProperty] = argPluginProperties[pluginProperty];
                                 }
                               }
                             }
                             else
                             {
                               gridProperties.plugins[ argPlugin ] = argPlugins[ argPlugin ];
                             }
                           }
                         }
                       }
                       else
                       {
                         gridProperties[ argProperty ] = args[ argProperty ];
                       }
                   }
               }
             }

             gridProperties.updater = this;
             gridProperties.store = this.dataStore;

             return gridProperties;
           };

           GridUpdater.prototype.initializeStore = function(store)
           {
             var self = this;

             function processData(data)
             {
                 var dataSet = false;
                 if (!store)
                 {
                     store = new ObjectStore({objectStore: new Memory({data: data, idProperty: "id"})});
                     dataSet = true;
                 }
                 self.dataStore = store
                 self.store = store;
                 if (store instanceof ObjectStore)
                 {
                     if( store.objectStore instanceof Memory)
                     {
                         self.memoryStore = store.objectStore;
                     }
                     self.store = store.objectStore
                 }

                 if (data)
                 {
                     try
                     {
                         if ((dataSet || self.updateOrAppend(data)) && self.onUpdate)
                         {
                             self.onUpdate(data);
                         }
                     }
                     catch(e)
                     {
                         console.error(e);
                     }
                 }
             };

             if (this.serviceUrl)
             {
               var requestUrl = lang.isFunction(this.serviceUrl) ? this.serviceUrl() : this.serviceUrl;
               xhr.get({url: requestUrl, sync: true, handleAs: "json"}).then(processData, util.errorHandler);
             }
             else
             {
                 processData(this.initialData);
             }
           };

           GridUpdater.prototype.start = function(grid)
           {
               this.grid = grid;
               if (this.serviceUrl)
               {
                 updater.add(this);
               }
           };

           GridUpdater.prototype.destroy = function()
           {
             updater.remove(this);
             if (this.dataStore)
             {
                 this.dataStore.close();
                 this.dataStore = null;
             }
             this.store = null;
             this.memoryStore = null;
             this.grid = null;
           };

           GridUpdater.prototype.updateOrAppend = function(data)
           {
               return this.appendData ?
                       UpdatableStore.prototype.append.call(this, data, this.appendLimit):
                           UpdatableStore.prototype.update.call(this, data);
           };

           GridUpdater.prototype.refresh = function(data)
           {
               this.updating = true;
               try
               {
                   if (this.updateOrAppend(data))
                   {
                     // EnhancedGrid with Filter plugin has "filter" layer.
                     // The filter expression needs to be re-applied after the data update
                     var filterLayer = this.grid.layer("filter");
                     if ( filterLayer && filterLayer.filterDef)
                     {
                         var currentFilter = filterLayer.filterDef();

                         if (currentFilter)
                         {
                             // re-apply filter in the filter layer
                             filterLayer.filterDef(currentFilter);
                         }
                     }

                     // refresh grid to render updates
                     this.grid._refresh();
                   }
               }
               finally
               {
                   this.updating = false;
                   if (this.onUpdate)
                   {
                     this.onUpdate(data);
                   }
               }
           }

           GridUpdater.prototype.update = function()
           {
             if (this.updatable)
             {
                 this.performUpdate();
             }
           };

           GridUpdater.prototype.performUpdate = function()
           {
                 var self = this;
                 var requestUrl = lang.isFunction(this.serviceUrl) ? this.serviceUrl() : this.serviceUrl;
                 var requestArguments = {url: requestUrl, sync: properties.useSyncGet, handleAs: "json"};
                 xhr.get(requestArguments).then(function(data){self.refresh(data);});
           };

           GridUpdater.prototype.performRefresh = function(data)
           {
               if (!this.updating)
               {
                   this.refresh(data);
               }
           };

           return GridUpdater;
       });