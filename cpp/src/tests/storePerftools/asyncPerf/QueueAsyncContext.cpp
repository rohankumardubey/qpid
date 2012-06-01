/*
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
 */

/**
 * \file QueueContext.cpp
 */

#include "QueueAsyncContext.h"

#include <cassert>

namespace tests {
namespace storePerftools {
namespace asyncPerf {

QueueAsyncContext::QueueAsyncContext(boost::shared_ptr<MockPersistableQueue> q,
                                     const qpid::asyncStore::AsyncOperation::opCode op) :
        m_q(q),
        m_op(op)
{
    assert(m_q.get() != 0);
}

QueueAsyncContext::QueueAsyncContext(boost::shared_ptr<MockPersistableQueue> q,
                                     boost::shared_ptr<MockPersistableMessage> msg,
                                     const qpid::asyncStore::AsyncOperation::opCode op) :
        m_q(q),
        m_msg(msg),
        m_op(op)
{
    assert(m_q.get() != 0);
    assert(m_msg.get() != 0);
}

QueueAsyncContext::~QueueAsyncContext()
{}

qpid::asyncStore::AsyncOperation::opCode
QueueAsyncContext::getOpCode() const
{
    return m_op;
}

const char*
QueueAsyncContext::getOpStr() const
{
    return qpid::asyncStore::AsyncOperation::getOpStr(m_op);
}

boost::shared_ptr<MockPersistableQueue>
QueueAsyncContext::getQueue() const
{
    return m_q;
}

boost::shared_ptr<MockPersistableMessage>
QueueAsyncContext::getMessage() const
{
    return m_msg;
}

void
QueueAsyncContext::destroy()
{
    delete this;
}

}}} // namespace tests::storePerftools::asyncPerf
