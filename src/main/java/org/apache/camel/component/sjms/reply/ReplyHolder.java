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

import jakarta.jms.Message;
import jakarta.jms.Session;

import org.apache.camel.AsyncCallback;
import org.apache.camel.Exchange;

public class ReplyHolder {

    private final Exchange exchange;
    private final AsyncCallback callback;
    private final Message message;
    private final Session session;
    private final String originalCorrelationId;
    private final String correlationId;
    private long timeout;

    public ReplyHolder(Exchange exchange, AsyncCallback callback, String originalCorrelationId,
                       String correlationId, Message message, Session session) {
        this.exchange = exchange;
        this.callback = callback;
        this.originalCorrelationId = originalCorrelationId;
        this.correlationId = correlationId;
        this.message = message;
        this.session = session;
    }

    public ReplyHolder(Exchange exchange, AsyncCallback callback, String originalCorrelationId,
                       String correlationId, long timeout) {
        this(exchange, callback, originalCorrelationId, correlationId, null, null);
        this.timeout = timeout;
    }

    public Exchange getExchange() {
        return exchange;
    }

    public AsyncCallback getCallback() {
        return callback;
    }

    public String getOriginalCorrelationId() {
        return originalCorrelationId;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public Message getMessage() {
        return message;
    }

    public Session getSession() {
        return session;
    }

    public boolean isTimeout() {
        return message == null;
    }

    public long getRequestTimeout() {
        return timeout;
    }
}
