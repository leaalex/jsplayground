package runner

import (
	"bytes"
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/dop251/goja"
)

const defaultTimeout = 5 * time.Second

type Result struct {
	Output string `json:"output"`
	Error  string `json:"error,omitempty"`
}

func Run(ctx context.Context, code string) Result {
	if ctx == nil {
		ctx = context.Background()
	}
	deadline, ok := ctx.Deadline()
	if !ok {
		deadline = time.Now().Add(defaultTimeout)
	}
	timeout := time.Until(deadline)
	if timeout <= 0 {
		timeout = defaultTimeout
	}

	var mu sync.Mutex
	var outBuf, errBuf bytes.Buffer

	vm := goja.New()

	wrapLog := func(typ string) func(goja.FunctionCall) goja.Value {
		return func(call goja.FunctionCall) goja.Value {
			mu.Lock()
			defer mu.Unlock()
			args := make([]string, len(call.Arguments))
			for i, a := range call.Arguments {
				if a != nil && !goja.IsUndefined(a) && !goja.IsNull(a) {
					args[i] = a.String()
				}
			}
			line := strings.Join(args, " ") + "\n"
			if typ == "error" {
				errBuf.WriteString(line)
			} else {
				outBuf.WriteString(line)
			}
			return goja.Undefined()
		}
	}

	consoleObj := vm.NewObject()
	_ = consoleObj.Set("log", wrapLog("log"))
	_ = consoleObj.Set("error", wrapLog("error"))
	_ = consoleObj.Set("warn", wrapLog("warn"))
	_ = vm.Set("console", consoleObj)

	done := make(chan struct{})
	var runErr error
	go func() {
		defer func() {
			if r := recover(); r != nil {
				runErr = fmt.Errorf("panic: %v", r)
			}
			close(done)
		}()
		_, runErr = vm.RunString(code)
	}()

	select {
	case <-done:
		if runErr != nil {
			return Result{
				Output: outBuf.String() + errBuf.String(),
				Error:  runErr.Error(),
			}
		}
		return Result{
			Output: strings.TrimSuffix(outBuf.String()+errBuf.String(), "\n"),
		}
	case <-time.After(timeout):
		vm.Interrupt("execution timeout")
		<-done
		return Result{
			Output: outBuf.String() + errBuf.String(),
			Error:  "execution timeout",
		}
	}
}
