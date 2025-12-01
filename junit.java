import org.junit.Test;
import static org.junit.Assert.*;

public class DemoTest {
  @Test
  public void testAdd(){
    assertEquals(4, 2+2);
  }

  @Test
  public void testSub(){
    assertEquals(2, 4-2);
  }
}