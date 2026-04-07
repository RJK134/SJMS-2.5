package org.apache.camel.component.sjms;

import org.apache.camel.CamelContext;
import org.apache.camel.impl.DefaultCamelContext;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SjmsComponentTest {

    @Test
    public void testComponentCreation() throws Exception {
        CamelContext context = new DefaultCamelContext();
        SjmsComponent component = new SjmsComponent();
        component.setCamelContext(context);
        assertNotNull(component);
    }
}
