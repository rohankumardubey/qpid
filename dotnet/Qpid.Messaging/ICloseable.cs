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
using System;

namespace Apache.Qpid.Messaging
{
    /// <summary>An ICloseable is a resource that can be explicitly closed. Generally speaking a closed resource can no longer be used, and the
    /// act of closing a resource is usually interpreted as a signal that the closed item can have its resource cleaned up and de-allocated.
    /// </summary>
    public interface ICloseable
    {
        /// <summary> Close the resource. </summary>
        void Close();
    }
}
