/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.camel.component.sjms.reply;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.ScheduledExecutorService;

import jakarta.jms.Destination;

import org.apache.camel.AsyncCallback;
import org.apache.camel.Exchange;
import org.apache.camel.component.sjms.SessionMessageListener;
import org.apache.camel.component.sjms.SjmsEndpoint;

public interface ReplyManager extends SessionMessageListener {

    void setEndpoint(SjmsEndpoint endpoint);

    void setReplyTo(Destination replyTo);

    void setScheduledExecutorService(ScheduledExecutorService executorService);

    void setOnTimeoutExecutorService(ExecutorService executorService);

    Destination getReplyTo();

    String registerReply(
            ReplyManager replyManager, Exchange exchange, AsyncCallback callback,
            String originalCorrelationId, String correlationId, long requestTimeout);

    void updateCorrelationId(String correlationId, String newCorrelationId, long requestTimeout);

    void processReply(ReplyHolder holder);
}
